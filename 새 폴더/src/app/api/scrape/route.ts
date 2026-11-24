import { NextRequest, NextResponse } from 'next/server';
import * as cheerio from 'cheerio';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/**
 * 쇼핑몰 상품 URL 메타데이터 및 의류 이미지 스크래핑 API
 * 
 * [동작 흐름]
 * 1. 전달받은 URL 유효성 검사
 * 2. 데스크톱 브라우저 User-Agent 및 헤더 설정 후 HTML 패치
 * 3. Cheerio를 이용해 og:image, og:title, 상품 메인 이미지 목록 파싱
 * 4. 작은 아이콘(1x1 추적 픽셀, 로고, 불필요한 배너) 필터링 및 절대 URL 변환
 * 5. 크롤링 차단(403/401/WAF) 시 친절한 안내와 함께 실패 응답 반환 -> 클라이언트에서 직접 업로드 모드로 자동 전환
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { url } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json(
        { success: false, error: '유효한 쇼핑몰 URL을 입력해 주세요.' },
        { status: 400 }
      );
    }

    // URL 프로토콜 정규화
    let targetUrl = url.trim();
    if (!targetUrl.startsWith('http://') && !targetUrl.startsWith('https://')) {
      targetUrl = `https://${targetUrl}`;
    }

    // URL 유효성 파싱
    let parsedUrl: URL;
    try {
      parsedUrl = new URL(targetUrl);
    } catch {
      return NextResponse.json(
        { success: false, error: '올바른 URL 형식이 아닙니다.' },
        { status: 400 }
      );
    }

    // 브라우저 위장 요청 헤더 (보안 봇 차단 완화)
    const headers = {
      'User-Agent':
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36',
      'Accept':
        'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8',
      'Accept-Language': 'ko-KR,ko;q=0.9,en-US;q=0.8,en;q=0.7',
      'Cache-Control': 'no-cache',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8초 타임아웃

    let response: Response;
    try {
      response = await fetch(parsedUrl.toString(), {
        headers,
        signal: controller.signal,
        redirect: 'follow',
      });
    } catch (fetchError: unknown) {
      clearTimeout(timeoutId);
      const isAbort = fetchError instanceof Error && fetchError.name === 'AbortError';
      return NextResponse.json(
        {
          success: false,
          error: isAbort
            ? '해당 사이트의 응답 시간이 초과되었습니다. 옷 사진을 직접 올려주세요.'
            : '해당 사이트에 접속할 수 없습니다. 옷 사진을 직접 올려주세요.',
          fallbackToUpload: true,
        },
        { status: 422 }
      );
    } finally {
      clearTimeout(timeoutId);
    }

    if (!response.ok) {
      return NextResponse.json(
        {
          success: false,
          error: `쇼핑몰 보안 정책으로 접근이 제한되었습니다 (상태코드: ${response.status}). 옷 사진을 직접 올려주세요.`,
          fallbackToUpload: true,
        },
        { status: 200 } // 클라이언트에서 자연스러운 에러 안내 모달/알림 처리를 위해 200 처리
      );
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. 상품 제목 추출
    const ogTitle = $('meta[property="og:title"]').attr('content');
    const twitterTitle = $('meta[name="twitter:title"]').attr('content');
    const pageTitle = $('title').text();
    const h1Title = $('h1').first().text();

    const title = (ogTitle || twitterTitle || h1Title || pageTitle || '쇼핑몰 의류 상품')
      .replace(/\s+/g, ' ')
      .trim();

    // 2. 브랜드 / 쇼핑몰 이름 추출
    const siteName =
      $('meta[property="og:site_name"]').attr('content') ||
      parsedUrl.hostname.replace('www.', '').split('.')[0].toUpperCase();

    // 3. 가격 메타 정보 추출
    const ogPrice =
      $('meta[property="product:price:amount"]').attr('content') ||
      $('meta[property="og:price:amount"]').attr('content');

    // 4. 고해상도 의류 이미지 후보 수집
    const candidateImages = new Set<string>();

    // 4-1. Open Graph 대표 이미지
    const ogImage = $('meta[property="og:image"]').attr('content');
    if (ogImage) candidateImages.add(resolveUrl(ogImage, parsedUrl));

    const twitterImage = $('meta[name="twitter:image"]').attr('content');
    if (twitterImage) candidateImages.add(resolveUrl(twitterImage, parsedUrl));

    // 4-2. 쇼핑몰 주요 상세/썸네일 이미지 태그 탐색
    $('img').each((_, el) => {
      const src =
        $(el).attr('data-src') ||
        $(el).attr('data-original') ||
        $(el).attr('data-zoom-image') ||
        $(el).attr('data-large_image') ||
        $(el).attr('src');

      if (!src) return;

      // 필터링: 1x1 투명 gif, svg 아이콘, 통계 픽셀, 버튼 아이콘 등 제외
      const lower = src.toLowerCase();
      if (
        lower.includes('blank.gif') ||
        lower.includes('spacer.gif') ||
        lower.includes('tracker') ||
        lower.includes('analytics') ||
        lower.includes('icon') ||
        lower.includes('logo') ||
        lower.includes('badge') ||
        lower.endsWith('.svg')
      ) {
        return;
      }

      // data:image/base64 중 너무 작은 것 제외
      if (src.startsWith('data:image')) {
        if (src.length > 3000) {
          candidateImages.add(src);
        }
        return;
      }

      const absoluteUrl = resolveUrl(src, parsedUrl);
      if (absoluteUrl) {
        candidateImages.add(absoluteUrl);
      }
    });

    const images = Array.from(candidateImages).slice(0, 12); // 최대 12장 반환

    if (images.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: '상품 페이지에서 의류 이미지를 자동으로 찾지 못했습니다. 옷 사진을 직접 올려주세요.',
          fallbackToUpload: true,
        },
        { status: 200 }
      );
    }

    return NextResponse.json({
      success: true,
      title,
      brand: siteName,
      price: ogPrice ? `${Number(ogPrice).toLocaleString()}원` : undefined,
      images,
      selectedImage: images[0],
    });
  } catch (error: unknown) {
    console.error('URL Scrape Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: '이미지를 자동으로 불러오지 못했습니다. 옷 사진을 직접 올려주세요.',
        fallbackToUpload: true,
      },
      { status: 200 }
    );
  }
}

/**
 * 상대 경로 URL을 절대 경로 URL로 변환하는 유틸리티
 */
function resolveUrl(relativeUrl: string, baseUrl: URL): string {
  try {
    if (relativeUrl.startsWith('//')) {
      return `${baseUrl.protocol}${relativeUrl}`;
    }
    return new URL(relativeUrl, baseUrl.href).href;
  } catch {
    return relativeUrl;
  }
}
