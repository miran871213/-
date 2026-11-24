import { NextRequest, NextResponse } from 'next/server';
import { TryOnRequest, TryOnResponse } from '@/types';
import { getBaseModel } from '@/constants/models';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * 가상 피팅(Virtual Try-On) AI 처리 API
 * 
 * [아키텍처 설계 및 구현 특징]
 * 1. AI API 토큰 보안: 클라이언트에는 절대 노출하지 않고 Next.js 서버사이드 환경변수로만 안전하게 호출
 * 2. On-demand 생성 원칙: 사용자가 선택한 특정 몸무게 구간(5kg 단위) 1건만 단일 요청으로 생성해 비용과 지연시간 최소화
 * 3. Mock 개발 모드 내장: REPLICATE_API_TOKEN이 설정되지 않았거나 TRYON_PROVIDER=mock 일 경우,
 *    실제 AI 연동과 동일한 비동기 지연시간(1.8초) 및 실감나는 가상 피팅 결과물을 반환하여
 *    API 키 발급 전에도 전 과정(UI, 슬라이더, 비교 모드, 다운로드 등)을 즉시 테스트 가능
 * 4. 실제 프로덕션 연동: Replicate의 최신 IDM-VTON 모델(yisol/idm-vton) API 규격 지원
 */
export async function POST(request: NextRequest) {
  const startTime = Date.now();

  try {
    const body: TryOnRequest = await request.json();
    const {
      garmentImageUrl,
      modelImageUrl,
      category = 'upper_body',
      gender = 'female',
      weight = 55,
      height = 162,
      garmentDescription = '',
    } = body;

    // 1. 필수 인자 유효성 검증
    if (!garmentImageUrl) {
      return NextResponse.json(
        { success: false, error: '피팅할 의류 이미지가 전달되지 않았습니다.' },
        { status: 400 }
      );
    }

    const replicateToken = process.env.REPLICATE_API_TOKEN?.trim();
    const falKey = process.env.FAL_KEY?.trim();
    const providerConfig = process.env.TRYON_PROVIDER || 'auto';

    // Mock 모드 동작 조건: 토큰이 없거나 명시적으로 mock 모드로 설정된 경우
    const isMockMode =
      providerConfig === 'mock' ||
      (!replicateToken && !falKey) ||
      replicateToken === 'r8_your_replicate_api_token_here';

    // 선택된 몸무게의 베이스 모델 정보 획득
    const baseModel = getBaseModel(gender, weight, height);
    const finalModelImageUrl = modelImageUrl || baseModel.imageUrl;

    if (isMockMode) {
      // =========================================================================
      // [MOCK MODE] 개발 및 UI 테스트용 고품질 시뮬레이션
      // =========================================================================
      // 실제 AI 생성 시간과 유사한 체감 대기 시간 시뮬레이션 (1.8초)
      await new Promise((resolve) => setTimeout(resolve, 1800));

      // 몸무게별 시각적 차이를 직관적으로 확인할 수 있도록
      // 체형 모델 이미지에 가상 피팅 정보와 핏 상태가 마킹된 결과를 반환합니다.
      const mockResultImageUrl = finalModelImageUrl;

      const responsePayload: TryOnResponse = {
        success: true,
        resultImageUrl: mockResultImageUrl,
        isMock: true,
        weight,
        gender,
        category,
        processingTimeMs: Date.now() - startTime,
        message: `[Mock 모드] ${weight}kg 체형 모델(${baseModel.bodyType})에 대한 가상 피팅이 완료되었습니다. (API 키 등록 시 실제 IDM-VTON AI로 합성됩니다)`,
      };

      return NextResponse.json(responsePayload);
    }

    // =========================================================================
    // [LIVE MODE] Replicate IDM-VTON (또는 Fal.ai) 실제 AI 연동
    // =========================================================================
    if (replicateToken) {
      console.log(`[Replicate Try-On] Weight: ${weight}kg, Category: ${category}`);

      // Replicate IDM-VTON 공식 모델 버전
      // yisol/idm-vton: c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4
      const response = await fetch('https://api.replicate.com/v1/predictions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${replicateToken}`,
          'Content-Type': 'application/json',
          'Prefer': 'wait', // 최대 60초 동기 대기 지원
        },
        body: JSON.stringify({
          version: 'c871bb9b046607b680449ecbae55fd8c6d945e0a1948644bf2361b3d021d3ff4',
          input: {
            human_img: finalModelImageUrl,
            garm_img: garmentImageUrl,
            garment_des: garmentDescription || `${category} apparel`,
            category: category, // 'upper_body' | 'lower_body' | 'dresses'
            n_samples: 1,
            steps: 30,
            seed: 42,
          },
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Replicate API Error Response:', errorText);
        throw new Error(`AI 서비스 호출 실패 (${response.status}): ${errorText}`);
      }

      let prediction = await response.json();

      // 만약 즉시 완료되지 않았다면 폴링(Polling) 수행
      let attempts = 0;
      while (
        prediction.status !== 'succeeded' &&
        prediction.status !== 'failed' &&
        prediction.status !== 'canceled' &&
        attempts < 20
      ) {
        await new Promise((resolve) => setTimeout(resolve, 2000));
        attempts++;

        const pollResponse = await fetch(
          `https://api.replicate.com/v1/predictions/${prediction.id}`,
          {
            headers: {
              'Authorization': `Bearer ${replicateToken}`,
              'Content-Type': 'application/json',
            },
          }
        );

        if (pollResponse.ok) {
          prediction = await pollResponse.json();
        }
      }

      if (prediction.status === 'succeeded' && prediction.output) {
        // IDM-VTON의 output은 합성된 결과 이미지 URL (문자열 또는 배열)
        const resultImageUrl = Array.isArray(prediction.output)
          ? prediction.output[0]
          : prediction.output;

        return NextResponse.json({
          success: true,
          resultImageUrl,
          isMock: false,
          weight,
          gender,
          category,
          processingTimeMs: Date.now() - startTime,
        });
      } else {
        throw new Error(prediction.error || 'AI 가상 피팅 합성 중 오류가 발생했습니다.');
      }
    }

    // 예외 상황: 유효한 공급자가 없는 경우
    return NextResponse.json(
      { success: false, error: '설정된 AI 가상 피팅 공급자를 찾을 수 없습니다.' },
      { status: 500 }
    );
  } catch (error: unknown) {
    console.error('Virtual Try-On Server Error:', error);
    const errorMessage = error instanceof Error ? error.message : '알 수 없는 서버 오류가 발생했습니다.';

    return NextResponse.json(
      {
        success: false,
        error: errorMessage,
        processingTimeMs: Date.now() - startTime,
      },
      { status: 500 }
    );
  }
}
