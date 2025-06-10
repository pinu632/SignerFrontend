import { useEffect, useRef, useState } from 'react';
import { getDocument, GlobalWorkerOptions } from 'pdfjs-dist';

GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';

export default function PdfViewer({ url, style, onScaleChange }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isCancelled = false;

    const renderPDF = async () => {
      if (!url || typeof url !== 'string' || !url.endsWith('.pdf')) {
        console.warn("Invalid or missing PDF URL:", url);
        return;
      }

      const container = containerRef.current;
      if (!container || container.clientHeight === 0 || container.clientWidth === 0) {
        console.warn("Container not ready yet. Delaying rendering...");
        return;
      }

      try {
        setLoading(true);
        const loadingTask = getDocument({ url, withCredentials: false });
        const pdf = await loadingTask.promise;
        const page = await pdf.getPage(1);

        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;

        const unscaledViewport = page.getViewport({ scale: 1 });
        const scaleX = containerWidth / unscaledViewport.width;
        const scaleY = containerHeight / unscaledViewport.height;
        const scale = Math.min(scaleX, scaleY);

        if (onScaleChange) onScaleChange(scale);

        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        canvas.width = viewport.width * dpr;
        canvas.height = viewport.height * dpr;
        canvas.style.width = `${viewport.width}px`;
        canvas.style.height = `${viewport.height}px`;
        canvas.style.position = 'absolute';
        canvas.style.top = '0';
        canvas.style.left = '0';

        context.setTransform(dpr, 0, 0, dpr, 0, 0);
        context.clearRect(0, 0, canvas.width, canvas.height);

        await page.render({ canvasContext: context, viewport }).promise;
        if (!isCancelled) setLoading(false);
      } catch (err) {
        console.error("PDF render error:", err);
        if (!isCancelled) setLoading(false);
      }
    };

    // Retry until container is ready
    let retryCount = 0;
    const retryInterval = setInterval(() => {
      const containerReady =
        containerRef.current &&
        containerRef.current.clientHeight > 0 &&
        containerRef.current.clientWidth > 0;

      if (url && containerReady) {
        clearInterval(retryInterval);
        renderPDF();
      } else if (retryCount >= 10) {
        console.warn("Failed to load PDF after multiple retries.");
        clearInterval(retryInterval);
      }

      retryCount++;
    }, 200);

    return () => {
      isCancelled = true;
      clearInterval(retryInterval);
    };
  }, [url, onScaleChange]);

  return (
    <div
      ref={containerRef}
      style={{
        width: '100%',
        height: '100%',
        position: 'relative',
        ...style
      }}
    >
      {loading && (
        <div style={{ position: 'absolute', top: 0, left: 0, padding: '10px', zIndex: 1 }}>
          <p>Loading PDF...</p>
        </div>
      )}
      <canvas ref={canvasRef} />
    </div>
  );
}
