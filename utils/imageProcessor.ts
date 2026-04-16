import { removeBackground, Config } from '@imgly/background-removal';

/**
 * 브라우저 내에서 AI 모델을 사용하여 이미지의 배경을 제거합니다.
 * 서버 비용이나 외부 API 호출 없이 무과금으로 동작합니다.
 */
export const processRemoveBackground = async (file: File): Promise<Blob> => {
  const config: Config = {
    publicPath: 'https://static.img.ly/packages/@imgly/background-removal@1.4.5/dist/',
    debug: false,
  };

  try {
    return await removeBackground(file, config);
  } catch (error) {
    console.error('AI 배경 제거 중 오류 발생:', error);
    throw error;
  }
};
