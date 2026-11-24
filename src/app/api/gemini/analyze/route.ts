import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';
export const maxDuration = 45;

/**
 * Gemini 3.8 Flash 기반 패션 핏 & 체형 스타일링 분석 API
 * 
 * [동작 원리]
 * 1. 요청 헤더(x-gemini-api-key) 또는 Body에서 사용자가 직접 입력한 API 키 추출
 * 2. 키가 없을 경우 서버 환경변수(GEMINI_API_KEY) 확인, 둘 다 없으면 친절한 안내 반환
 * 3. Gemini 3.8 Flash (호환 모델 fallback 포함) 호출을 통해
 *    선택된 의류 정보와 사용자의 신장/체중/BMI 체형 데이터를 정밀 분석하여
 *    맞춤형 핏 진단, 추천 사이즈, 체형 보정 스타일링 팁 제공
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      garment,
      bodyProfile,
      compareProfile,
      questionType = 'fit_analysis',
      model = 'gemini-3.8-flash',
    } = body;

    // API 키 확인: 1) 클라이언트 헤더 -> 2) Body -> 3) 서버 환경변수
    const headerKey = request.headers.get('x-gemini-api-key')?.trim();
    const bodyKey = body.apiKey?.trim();
    const envKey = process.env.GEMINI_API_KEY?.trim();

    const apiKey = headerKey || bodyKey || envKey;

    if (!apiKey) {
      return NextResponse.json(
        {
          success: false,
          error:
            'Gemini API 키가 입력되지 않았습니다. 상단의 [Gemini API 키] 버튼을 눌러 개인 키를 등록해 주세요.',
          needsApiKey: true,
        },
        { status: 401 }
      );
    }

    if (!garment || !bodyProfile) {
      return NextResponse.json(
        { success: false, error: '분석에 필요한 의류 또는 체형 정보가 부족합니다.' },
        { status: 400 }
      );
    }

    // 분석용 프롬프트 생성
    const prompt = buildFashionAnalysisPrompt({
      garment,
      bodyProfile,
      compareProfile,
      questionType,
    });

    // 사용자가 선택한 모델을 최우선으로 배치하고 fallback 체인 구성
    const requestedModel = (model || 'gemini-3.8-flash').trim();
    const fallbackList = [
      'gemini-3.8-flash',
      'gemini-3.5-flash-lite',
      'gemini-2.5-flash',
      'gemini-1.5-flash',
    ];
    const candidateModels = [
      requestedModel,
      ...fallbackList.filter((m) => m !== requestedModel),
    ];

    let lastError = '';
    let resultText = '';
    let usedModel = candidateModels[0];

    for (const modelName of candidateModels) {
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;

        const geminiRes = await fetch(endpoint, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: prompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.6,
              topK: 40,
              topP: 0.95,
              maxOutputTokens: 1200,
            },
          }),
        });

        if (geminiRes.ok) {
          const data = await geminiRes.json();
          resultText =
            data.candidates?.[0]?.content?.parts?.[0]?.text ||
            '분석 결과를 생성하지 못했습니다.';
          usedModel = modelName;
          break; // 성공 시 루프 종료
        } else {
          const errBody = await geminiRes.text();
          lastError = `[${geminiRes.status}] ${errBody}`;
          // 404 (모델 미지원/이름 변경)일 경우 다음 모델로 자동 시도
          if (geminiRes.status === 404) {
            continue;
          } else {
            break; // 인증 오류(400, 403) 등은 즉시 중단
          }
        }
      } catch (fetchErr: unknown) {
        lastError = fetchErr instanceof Error ? fetchErr.message : '네트워크 오류';
      }
    }

    if (!resultText) {
      console.error('Gemini API Error:', lastError);
      return NextResponse.json(
        {
          success: false,
          error:
            'Gemini API 호출에 실패했습니다. 올바른 API 키인지 확인해 주세요. (' +
            lastError +
            ')',
        },
        { status: 502 }
      );
    }

    return NextResponse.json({
      success: true,
      analysis: resultText,
      modelUsed: usedModel,
      questionType,
    });
  } catch (error: unknown) {
    console.error('Gemini Route Exception:', error);
    return NextResponse.json(
      { success: false, error: '서버 내부 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}

/**
 * 패션 핏 & 체형 분석용 Gemini 프롬프트 구성 함수
 */
function buildFashionAnalysisPrompt({
  garment,
  bodyProfile,
  compareProfile,
  questionType,
}: {
  garment: { name: string; category: string; imageUrl?: string };
  bodyProfile: {
    gender: string;
    height: number;
    weight: number;
    bmi: number;
    bodyType: string;
    silhouetteDesc: string;
  };
  compareProfile?: {
    gender: string;
    height: number;
    weight: number;
    bmi: number;
    bodyType: string;
  };
  questionType: string;
}): string {
  const genderKorean = bodyProfile.gender === 'female' ? '여성' : '남성';
  const categoryKorean =
    garment.category === 'upper_body'
      ? '상의(Top)'
      : garment.category === 'lower_body'
      ? '하의(Bottom)'
      : '원피스/세트(Dress)';

  let baseContext = `당신은 최고 수준의 AI 패션 전문 스타일리스트이자 맞춤 핏(Fit) 진단가입니다.
사용자가 온라인 쇼핑 중 의류의 실제 착용 핏과 사이즈를 고민하고 있습니다.

[의류 상품 정보]
- 상품명: ${garment.name}
- 카테고리: ${categoryKorean}

[사용자 기본 체형 프로필]
- 성별: ${genderKorean}
- 신장: ${bodyProfile.height}cm
- 체중: ${bodyProfile.weight}kg (5kg 단위 체형 모델)
- 체질량지수(BMI): ${bodyProfile.bmi}
- 체형 분류: ${bodyProfile.bodyType}
- 체형 특징: ${bodyProfile.silhouetteDesc}
`;

  if (compareProfile) {
    baseContext += `
[비교 대상 체형 프로필]
- 체중: ${compareProfile.weight}kg (체중 차이: ${Math.abs(
      bodyProfile.weight - compareProfile.weight
    )}kg)
- 체형 분류: ${compareProfile.bodyType}
- BMI: ${compareProfile.bmi}
`;
  }

  let taskInstruction = '';

  switch (questionType) {
    case 'size_recommendation':
      taskInstruction = `
[요청 작업: 최적 추천 사이즈 가이드]
1. 위 체형(${bodyProfile.height}cm / ${bodyProfile.weight}kg)에 가장 권장하는 기성복 사이즈(예: S, M, L, XL, Free)를 명확히 제시해 주세요.
2. '정핏(Regular Fit)'으로 깔끔하게 입고 싶을 때와, '루즈/오버핏(Relaxed Fit)'으로 입고 싶을 때 각각 어떤 사이즈를 골라야 하는지 비교해 주세요.
3. 구매 시 반드시 실측표에서 확인해야 할 핵심 치수(어깨 너비, 가슴 단면, 총기장 등) 2~3가지를 짚어주세요.
`;
      break;

    case 'styling_advice':
      taskInstruction = `
[요청 작업: 체형 보정 스타일링 & 코디 팁]
1. ${bodyProfile.weight}kg 체형의 장점을 살리고 단점을 자연스럽게 커버할 수 있는 이 의류의 착용 팁을 알려주세요.
2. 함께 매치하면 전체적인 비율이 좋아 보이는 어울리는 하의/아우터/신발 아이템 2~3가지를 추천해 주세요.
3. 옷을 입을 때 팁(예: 턱인(넣어 입기) 여부, 소매 롤업, 밑단 정리 팁 등)을 제공해 주세요.
`;
      break;

    case 'compare_weights':
      taskInstruction = `
[요청 작업: 두 몸무게 구간(${bodyProfile.weight}kg vs ${compareProfile?.weight || 60}kg) 핏 정밀 비교]
1. ${bodyProfile.weight}kg과 ${compareProfile?.weight || 60}kg에서 입었을 때 실루엣의 구체적인 차이점(가슴둘레, 어깨선 드롭 여부, 허리 및 밑단 여유감)을 항목별로 대조해 주세요.
2. 체중이 늘거나 줄었을 때 이 옷이 주는 분위기(슬림/단정함 vs 내추럴/여유로움)의 변화를 설명해 주세요.
3. 두 몸무게 중 본인의 평소 선호 스타일(타이트핏 vs 여유핏)에 따른 최종 추천을 내려주세요.
`;
      break;

    case 'fit_analysis':
    default:
      taskInstruction = `
[요청 작업: 5kg 단위 체형 정밀 핏 진단]
1. [실루엣 총평]: ${bodyProfile.weight}kg 모델 착용 시 옷이 어떤 핏(타이트, 레귤러, 세미오버, 오버핏 등)으로 연출되는지 한 문장으로 요약해 주세요.
2. [부위별 핏 디테일]:
   - 어깨 & 암홀 라인
   - 가슴 & 상체 품
   - 총기장 및 허리/밑단 실루엣
3. [착용감 및 활동성]: 일상 착용 시 신축성과 편안함 관점에서의 피드백을 전달해 주세요.
`;
      break;
  }

  return `${baseContext}
${taskInstruction}

[답변 작성 가이드]
- 가독성이 높도록 Markdown 형식(불렛 포인트, 굵은 글씨 등)을 활용해 구조화해 주세요.
- 한국 소비자가 알기 쉬운 자연스럽고 친절하며 전문적인 패션 에디터 어조로 답변해 주세요.
- 너무 추상적인 말 대신 신체 치수와 옷의 여유감(품, 라인)에 초점을 맞춰 구체적으로 조언해 주세요.
`;
}
