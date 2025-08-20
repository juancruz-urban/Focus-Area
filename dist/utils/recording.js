
import { useRef } from "react";

export function recording(){



    

const recorderRefNormal = useRef(null);
const chunksRefNormal = useRef([]);

async function startRecording() {
  try {
    const stream = await navigator.mediaDevices.getDisplayMedia({
      video: { frameRate: 30 },
      audio: false
    });

    

    recorderRefNormal.current = new MediaRecorder(stream, {
      mimeType: "video/webm;codecs=vp9"
    });

    recorderRefNormal.current.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunksRefNormal.current.push(event.data);
      }
    };

    recorderRefNormal.current.onstop = () => {
      if (chunksRefNormal.current.length) {
        const blob = new Blob(chunksRefNormal.current, { type: "video/webm" });
        const url = URL.createObjectURL(blob);

        const a = document.createElement("a");
        a.href = url;
        a.download = `screen-recording-${Date.now()}.webm`;
        a.click();

        URL.revokeObjectURL(url);
      } else {
        console.error("No se grabaron datos, archivo vacío.");
      }
    };

    // IMPORTANTE: usar timeslice para que se generen datos periódicamente
    recorderRefNormal.current.start(100); // cada 100ms manda chunks

    console.log("Grabación iniciada...");
  } catch (error) {
    console.error("Error al iniciar grabación:", error);
  }
}

function stopRecording() {
  if (recorderRefNormal.current && recorderRefNormal.current.state !== "inactive") {
    recorderRefNormal.current.stop();
    recorderRefNormal.current.stream.getTracks().forEach(track => track.stop());
    console.log("Grabación detenida.");
  }
}






     // Refs para recorder recortado
      const recorderRef = useRef(null);
      const chunksRef = useRef([]);
      const screenStreamRef = useRef(null);
      const rafRef = useRef(null);
      const videoElRef = useRef(null);
      const canvasRef = useRef(null);
      const ctxRef = useRef(null);
    
    
      /* --------------- Grabación SOLO área foco --------------- */
      const startCroppedRecording = async (includeToolbar, containerRef) => {
        if (!containerRef.current) {
          console.warn("FocusArea aún no está listo.");
          return;
        }
        try {
          // 1) Capturamos pantalla/ pestaña
          const screenStream = await navigator.mediaDevices.getDisplayMedia({
            video: { frameRate: 30 },
            audio: false,
          });
          screenStreamRef.current = screenStream;
    
          // 2) Preparamos video fuente
          const video = document.createElement("video");
          video.muted = true;
          video.srcObject = screenStream;
          await video.play();
          await new Promise((res) => {
            if (video.readyState >= 2) return res();
            video.onloadedmetadata = () => res();
          });
          videoElRef.current = video;
    
          // 3) Canvas de salida (solo el recorte)
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvasRef.current = canvas;
          ctxRef.current = ctx;
    
          const dpr = window.devicePixelRatio || 1;
          const draw = () => {
            const el = containerRef.current;
            if (!el) {
              rafRef.current = requestAnimationFrame(draw);
              return;
            }
            // Rect dinámico (sigue el movimiento y resize)
            const r = el.getBoundingClientRect();
            const topBar = 28;
            const crop = includeToolbar
              ? { left: r.left, top: r.top, width: r.width, height: r.height }
              : { left: r.left, top: r.top + topBar, width: r.width, height: Math.max(0, r.height - topBar) };
    
            // Ajustamos canvas a DPR para nitidez
            const outW = Math.max(1, Math.round(crop.width * dpr));
            const outH = Math.max(1, Math.round(crop.height * dpr));
            if (canvas.width !== outW || canvas.height !== outH) {
              canvas.width = outW;
              canvas.height = outH;
            }
    
            // Mapeo CSS px -> video px
            // Para captura de pestaña, normalmente video.videoWidth = window.innerWidth * DPR
            // por eso usamos factores en función del viewport actual:
            const fx = video.videoWidth / window.innerWidth;
            const fy = video.videoHeight / window.innerHeight;
    
            const sx = Math.max(0, crop.left * fx);
            const sy = Math.max(0, crop.top * fy);
            const sWidth = Math.max(1, crop.width * fx);
            const sHeight = Math.max(1, crop.height * fy);
    
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(video, sx, sy+115, sWidth, sHeight-115, 0, 0, canvas.width, canvas.height);
    
            rafRef.current = requestAnimationFrame(draw);
          };
    
          draw();
    
          // 4) Stream recortado desde el canvas
          const croppedStream = canvas.captureStream(30);
    
          // 5) MediaRecorder sobre el stream recortado
          chunksRef.current = [];
          const mr = new MediaRecorder(croppedStream, { mimeType: "video/webm;codecs=vp9" });
          recorderRef.current = mr;
    
          mr.ondataavailable = (e) => {
            if (e.data && e.data.size > 0) chunksRef.current.push(e.data);
          };
          mr.onstop = () => {
            try {
              cancelAnimationFrame(rafRef.current);
            } catch {}
            // Descargar
            if (chunksRef.current.length) {
              const blob = new Blob(chunksRef.current, { type: "video/webm" });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = `focus-crop-${Date.now()}.webm`;
              a.click();
              URL.revokeObjectURL(url);
            } else {
              console.warn("No se grabaron datos (chunks vacíos).");
            }
            // Detener fuentes
            screenStreamRef.current?.getTracks().forEach((t) => t.stop());
            screenStreamRef.current = null;
            videoElRef.current = null;
          };
    
          // Importante: timeslice para que no quede 0 B
          mr.start(200);
          console.log("▶️ Grabando solo el área de foco…");
        } catch (err) {
          console.error("Error al iniciar grabación recortada:", err);
        }
      };
    
      const stopCroppedRecording = () => {
        if (recorderRef.current && recorderRef.current.state !== "inactive") {
          recorderRef.current.stop();
          console.log("⏹ Grabación recortada detenida.");
        }
      };

      return{startRecording,stopRecording,startCroppedRecording, stopCroppedRecording}
    
}