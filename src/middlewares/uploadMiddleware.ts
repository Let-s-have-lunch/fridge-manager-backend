import multer from "multer";

// 디스크에 저장하지 않고 메모리에 버퍼(Buffer) 형태로 들고 있습니다.
// OCR API로 바로 넘길 때 파일 찌꺼기가 남지 않아 관리하기 편합니다.
const storage = multer.memoryStorage();

export const upload = multer({
    storage,
    limits: {
        fileSize: 5 * 1024 * 1024, // 5MB 용량 제한 (필요에 따라 조절)
    },
});
