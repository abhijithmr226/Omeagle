/**
 * Lightweight face detection using canvas skin-color heuristic.
 * Not perfect, but catches obvious cases (camera pointed at wall/ceiling/dark).
 */

export interface FaceCheckResult {
  faceDetected: boolean;
  brightness: number; // 0-255
  skinRatio: number;  // 0-1
}

export function detectFace(stream: MediaStream): Promise<FaceCheckResult> {
  return new Promise((resolve) => {
    const video = document.createElement('video');
    video.srcObject = stream;
    video.autoplay = true;
    video.playsInline = true;
    video.muted = true;

    const timeout = setTimeout(() => {
      video.srcObject = null;
      resolve({ faceDetected: false, brightness: 128, skinRatio: 0 });
    }, 3000);

    video.onloadeddata = () => {
      setTimeout(() => {
        try {
          const canvas = document.createElement('canvas');
          const w = 160;
          const h = 120;
          canvas.width = w;
          canvas.height = h;
          const ctx = canvas.getContext('2d');
          if (!ctx) { clearTimeout(timeout); video.srcObject = null; resolve({ faceDetected: false, brightness: 128, skinRatio: 0 }); return; }

          ctx.drawImage(video, 0, 0, w, h);
          const imageData = ctx.getImageData(0, 0, w, h);
          const data = imageData.data;

          let totalBrightness = 0;
          let skinPixels = 0;
          const totalPixels = w * h;

          for (let i = 0; i < data.length; i += 4) {
            const r = data[i];
            const g = data[i + 1];
            const b = data[i + 2];

            // Brightness
            totalBrightness += (r + g + b) / 3;

            // Skin color detection (RGB heuristic)
            if (r > 95 && g > 40 && b > 20
              && r > g && r > b
              && (r - g) > 15
              && Math.abs(r - g) > 15
              && r - b > 15) {
              skinPixels++;
            }
          }

          const brightness = totalBrightness / totalPixels;
          const skinRatio = skinPixels / totalPixels;

          // Face likely detected if there's enough skin-colored region
          // and the image isn't too dark or too bright
          const faceDetected = skinRatio > 0.05 && brightness > 30 && brightness < 240;

          clearTimeout(timeout);
          video.srcObject = null;
          resolve({ faceDetected, brightness, skinRatio });
        } catch {
          clearTimeout(timeout);
          video.srcObject = null;
          resolve({ faceDetected: false, brightness: 128, skinRatio: 0 });
        }
      }, 800); // Wait for first frame to render
    };

    video.onerror = () => {
      clearTimeout(timeout);
      video.srcObject = null;
      resolve({ faceDetected: false, brightness: 128, skinRatio: 0 });
    };
  });
}
