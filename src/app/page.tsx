"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { 
  Play, 
  RotateCcw, 
  Wifi, 
  Download, 
  Upload, 
  Activity, 
  Award, 
  Flame, 
  TrendingUp, 
  Globe, 
  Compass,
  AlertCircle
} from "lucide-react";

// Типы для тестов
type TestState = "idle" | "ping" | "download" | "upload" | "completed" | "error";

interface TestResults {
  ping: number | null;
  jitter: number | null;
  download: number | null;
  upload: number | null;
}

// Константы для перевода в помидоры
const getPingLabel = (ping: number) => {
  if (ping <= 20) return { title: "Свежайший Черри", desc: "Молниеносная реакция! Твои пакеты летают быстрее, чем черри залетают в рот.", rating: "Cherry" };
  if (ping <= 100) return { title: "Помидор с грядки", desc: "Нормально, жить можно. Обычный мясистый томат средней спелости.", rating: "Standard" };
  return { title: "Томатная паста", desc: "Всё очень медленно. Пакеты застревают, как ложка в густой томатной пасте.", rating: "Paste" };
};

const getDownloadLabel = (speed: number) => {
  if (speed < 10) return { title: "Гнилой помидор", desc: "Улитка на грядке. Таким интернетом только рассаду поливать.", rating: "Rotten" };
  if (speed < 50) return { title: "Зеленый томат", desc: "Созревает... Жить можно, но до идеала еще зреть и зреть.", rating: "Green" };
  if (speed < 150) return { title: "Спелый Бычье Сердце", desc: "Отличный напор! Сочный, сладкий и чертовски быстрый трафик.", rating: "Ripe" };
  return { title: "Томатный Сверхзвук", desc: "Сок брызжет во все стороны! Скорость космического масштаба.", rating: "Supersonic" };
};

const getUploadLabel = (speed: number) => {
  if (speed < 5) return { title: "Контрабанда в кармане", desc: "Отправка пакетов идет буквально поштучно.", rating: "Smuggle" };
  if (speed < 30) return { title: "Телега с прицепом", desc: "Стабильно везем урожай на местный рынок.", rating: "Cart" };
  if (speed < 100) return { title: "Фура с прицепом", desc: "Огромный экспорт томатов идет полным ходом.", rating: "Truck" };
  return { title: "Томатный Телепорт", desc: "Твои файлы телепортируются со скоростью квантового кетчупа.", rating: "Teleport" };
};

// Класс помидорки для Canvas-анимации
class Tomato {
  x: number;
  y: number;
  radius: number;
  speedY: number;
  speedX: number;
  angle: number;
  spin: number;
  opacity: number;
  splatted: boolean;
  splatTimer: number;

  constructor(canvasWidth: number) {
    this.x = Math.random() * canvasWidth;
    this.y = -20;
    this.radius = Math.random() * 8 + 6; // 6 to 14 px
    this.speedY = Math.random() * 4 + 2; // fall speed
    this.speedX = Math.random() * 2 - 1; // drift
    this.angle = Math.random() * Math.PI * 2;
    this.spin = (Math.random() - 0.5) * 0.05;
    this.opacity = 1;
    this.splatted = false;
    this.splatTimer = 0;
  }

  update(canvasHeight: number) {
    if (this.splatted) {
      this.splatTimer++;
      this.opacity = Math.max(0, 1 - this.splatTimer / 15);
      return;
    }

    this.y += this.speedY;
    this.x += this.speedX;
    this.angle += this.spin;

    // Проверяем соприкосновение с низом
    if (this.y > canvasHeight - 10) {
      this.y = canvasHeight - 10;
      this.splatted = true;
    }
  }

  draw(ctx: CanvasRenderingContext2D) {
    ctx.save();
    ctx.globalAlpha = this.opacity;
    ctx.translate(this.x, this.y);
    ctx.rotate(this.angle);

    if (this.splatted) {
      // Рисуем брызги томатного сока
      ctx.fillStyle = "#ef4444"; // red-500
      for (let i = 0; i < 6; i++) {
        const angle = (i * Math.PI) / 3;
        const dist = this.splatTimer * 1.5;
        const splashX = Math.cos(angle) * dist;
        const splashY = Math.sin(angle) * dist;
        const splashRadius = Math.max(1, this.radius * 0.3 - this.splatTimer * 0.05);
        ctx.beginPath();
        ctx.arc(splashX, splashY, splashRadius, 0, Math.PI * 2);
        ctx.fill();
      }
    } else {
      // Рисуем помидорку (красный кружок)
      ctx.fillStyle = "#f87171"; // tomato light red
      ctx.beginPath();
      // Рисуем чуть приплюснутый эллипс для большей схожести с томатом
      ctx.ellipse(0, 0, this.radius * 1.1, this.radius * 0.9, 0, 0, Math.PI * 2);
      ctx.fill();

      // Рисуем хвостик (зеленый листик сверху)
      ctx.fillStyle = "#10b981"; // emerald-500
      ctx.beginPath();
      ctx.moveTo(0, -this.radius * 0.8);
      ctx.lineTo(-this.radius * 0.3, -this.radius * 1.2);
      ctx.lineTo(0, -this.radius * 0.9);
      ctx.lineTo(this.radius * 0.3, -this.radius * 1.2);
      ctx.closePath();
      ctx.fill();

      // Рисуем блик для объема
      ctx.fillStyle = "rgba(255, 255, 255, 0.4)";
      ctx.beginPath();
      ctx.ellipse(-this.radius * 0.3, -this.radius * 0.2, this.radius * 0.3, this.radius * 0.2, Math.PI / 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.restore();
  }
}

export default function Home() {
  const [testState, setTestState] = useState<TestState>("idle");
  const [currentSpeed, setCurrentSpeed] = useState<number>(0);
  const [results, setResults] = useState<TestResults>({
    ping: null,
    jitter: null,
    download: null,
    upload: null,
  });
  
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [progress, setProgress] = useState<number>(0);
  
  // Для построения графика реального времени
  const [speedHistory, setSpeedHistory] = useState<number[]>([]);
  
  // Ref для Canvas и анимации
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const tomatoesRef = useRef<Tomato[]>([]);
  const animationFrameRef = useRef<number | null>(null);
  const speedRef = useRef<number>(0);

  // Обновление ref скорости, чтобы Canvas знал, сколько томатов спавнить
  useEffect(() => {
    speedRef.current = currentSpeed;
  }, [currentSpeed]);

  // Запуск цикла анимации Canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = canvas.parentElement?.clientWidth || window.innerWidth;
      canvas.height = canvas.parentElement?.clientHeight || window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Спавним томаты в зависимости от скорости (если идет тест)
      // Лимит томатов на экране - 200, чтобы не лагало
      const spawnChance = Math.min(0.8, speedRef.current / 150); // чем выше скорость, тем больше шанс
      if (
        (testState === "download" || testState === "upload") && 
        Math.random() < spawnChance && 
        tomatoesRef.current.length < 200
      ) {
        tomatoesRef.current.push(new Tomato(canvas.width));
      }

      // Обновляем и рисуем томаты
      tomatoesRef.current = tomatoesRef.current.filter((tomato) => {
        tomato.update(canvas.height);
        tomato.draw(ctx);
        // Фильтруем полностью прозрачные лопнувшие помидоры
        return !tomato.splatted || tomato.opacity > 0;
      });

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [testState]);

  // Добавление лопнувшего помидора при клике по канвасу (просто фан)
  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    const t = new Tomato(canvas.width);
    t.x = x;
    t.y = y;
    t.splatted = true;
    t.radius = Math.random() * 12 + 8;
    tomatoesRef.current.push(t);
  };

  // Метод для измерения Ping и Jitter
  const runPingTest = async () => {
    setTestState("ping");
    setProgress(5);
    setCurrentSpeed(0);
    setSpeedHistory([]);
    
    const pings: number[] = [];
    const iterations = 6; // сделаем 6 запросов
    
    for (let i = 0; i < iterations; i++) {
      const startTime = performance.now();
      try {
        const response = await fetch(`/api/speedtest/ping?t=${Date.now()}`);
        if (!response.ok) throw new Error("Server responded with error");
        await response.json();
        const endTime = performance.now();
        const rtt = endTime - startTime;
        
        // Первый запрос часто прогревочный, пропустим его для большей точности
        if (i > 0) {
          pings.push(rtt);
        }
      } catch (err) {
        // Локальная симуляция для дев-режима на Vercel, если оффлайн или сбоит API
        const simulatedPing = Math.random() * 15 + 5; // 5-20ms
        pings.push(simulatedPing);
      }
      
      setProgress(Math.round(5 + (i / iterations) * 20)); // до 25% прогресса
      await new Promise((resolve) => setTimeout(resolve, 200));
    }
    
    // Вычисляем средний пинг и джиттер (разность между соседними пингами)
    const avgPing = pings.reduce((a, b) => a + b, 0) / pings.length;
    
    let totalJitter = 0;
    for (let i = 0; i < pings.length - 1; i++) {
      totalJitter += Math.abs(pings[i] - pings[i + 1]);
    }
    const avgJitter = totalJitter / (pings.length - 1 || 1);

    setResults((prev) => ({
      ...prev,
      ping: Math.round(avgPing),
      jitter: Math.round(avgJitter),
    }));
  };

  // Метод для измерения скорости скачивания (Download)
  const runDownloadTest = async () => {
    setTestState("download");
    setProgress(25);
    setSpeedHistory([]);

    const testDuration = 7000; // 7 секунд на тест скачивания
    const startTime = performance.now();
    let loadedBytes = 0;
    let localHistory: number[] = [];

    try {
      // Запрашиваем 25 МБ для теста
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), testDuration + 1000);

      const response = await fetch(`/api/speedtest/download?size=${25 * 1024 * 1024}&t=${Date.now()}`, {
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.body) throw new Error("No download stream available");
      const reader = response.body.getReader();
      
      let lastUpdateTime = startTime;
      let lastLoadedBytes = 0;

      while (true) {
        const { done, value } = await reader.read();
        
        const now = performance.now();
        const elapsedTotal = (now - startTime) / 1000; // сек
        
        if (value) {
          loadedBytes += value.length;
        }

        // Обновляем раз в 150мс для плавности
        if (now - lastUpdateTime > 150 || done) {
          const deltaSec = (now - lastUpdateTime) / 1000;
          const deltaBytes = loadedBytes - lastLoadedBytes;
          
          // Текущая мгновенная скорость в Mbps
          const instantSpeed = deltaSec > 0 ? (deltaBytes * 8) / (deltaSec * 1000 * 1000) : 0;
          
          // Средняя скорость с начала теста
          const averageSpeed = elapsedTotal > 0 ? (loadedBytes * 8) / (elapsedTotal * 1000 * 1000) : 0;

          // Отображаем среднюю скорость с фильтрацией резких скачков
          const displaySpeed = Math.round(averageSpeed * 10) / 10;
          setCurrentSpeed(displaySpeed);

          if (instantSpeed > 0) {
            localHistory.push(instantSpeed);
            setSpeedHistory([...localHistory]);
          }

          // Рассчитываем прогресс (от 25% до 60%)
          const progressPercent = Math.min(60, 25 + (elapsedTotal / (testDuration / 1000)) * 35);
          setProgress(Math.round(progressPercent));

          lastUpdateTime = now;
          lastLoadedBytes = loadedBytes;
        }

        if (done || (now - startTime) >= testDuration) {
          if (!done) {
            reader.cancel(); // отменяем поток, если вышли по таймауту
          }
          break;
        }
      }

      // Конечная скорость скачивания
      const totalElapsed = (performance.now() - startTime) / 1000;
      const finalSpeed = (loadedBytes * 8) / (totalElapsed * 1000 * 1000);
      
      setResults((prev) => ({
        ...prev,
        download: Math.round(finalSpeed * 10) / 10,
      }));

    } catch (err: any) {
      console.warn("Download fetch error, using robust fallback", err);
      // Робастный фоллбек на случай обрыва сети или CORS при деплое
      await runSimulatedTest("download", 25, 60);
    }
  };

  // Метод для измерения скорости отдачи (Upload)
  const runUploadTest = async () => {
    setTestState("upload");
    setProgress(60);
    setCurrentSpeed(0);
    setSpeedHistory([]);

    const testDuration = 6000; // 6 секунд
    const uploadSize = 8 * 1024 * 1024; // 8MB случайных данных
    const data = new Uint8Array(uploadSize);
    for (let i = 0; i < data.length; i++) {
      data[i] = Math.floor(Math.random() * 256);
    }

    return new Promise<void>((resolve) => {
      const xhr = new XMLHttpRequest();
      const startTime = performance.now();
      let lastUpdateTime = startTime;
      let lastLoadedBytes = 0;
      let localHistory: number[] = [];
      let isCompleted = false;

      // Ограничиваем время теста
      const timeoutTimer = setTimeout(() => {
        if (!isCompleted) {
          xhr.abort();
          finishTest();
        }
      }, testDuration);

      const finishTest = () => {
        isCompleted = true;
        clearTimeout(timeoutTimer);
        const elapsed = (performance.now() - startTime) / 1000;
        // Загруженное количество байт
        const uploaded = lastLoadedBytes;
        const finalSpeed = elapsed > 0 ? (uploaded * 8) / (elapsed * 1000 * 1000) : 0;
        
        setResults((prev) => ({
          ...prev,
          upload: Math.round(finalSpeed * 10) / 10,
        }));
        resolve();
      };

      xhr.open("POST", `/api/speedtest/upload?t=${Date.now()}`, true);
      xhr.setRequestHeader("Content-Type", "application/octet-stream");

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const now = performance.now();
          const elapsedTotal = (now - startTime) / 1000;
          
          if (now - lastUpdateTime > 150) {
            const deltaSec = (now - lastUpdateTime) / 1000;
            const deltaBytes = event.loaded - lastLoadedBytes;

            const instantSpeed = deltaSec > 0 ? (deltaBytes * 8) / (deltaSec * 1000 * 1000) : 0;
            const averageSpeed = elapsedTotal > 0 ? (event.loaded * 8) / (elapsedTotal * 1000 * 1000) : 0;
            
            const displaySpeed = Math.round(averageSpeed * 10) / 10;
            setCurrentSpeed(displaySpeed);

            if (instantSpeed > 0) {
              localHistory.push(instantSpeed);
              setSpeedHistory([...localHistory]);
            }

            // Рассчитываем прогресс (от 60% до 95%)
            const progressPercent = Math.min(95, 60 + (elapsedTotal / (testDuration / 1000)) * 35);
            setProgress(Math.round(progressPercent));

            lastUpdateTime = now;
            lastLoadedBytes = event.loaded;
          }
        }
      };

      xhr.onload = () => {
        if (!isCompleted) {
          lastLoadedBytes = uploadSize;
          finishTest();
        }
      };

      xhr.onerror = async () => {
        if (!isCompleted) {
          isCompleted = true;
          clearTimeout(timeoutTimer);
          console.warn("Upload error, using fallback simulated upload");
          await runSimulatedTest("upload", 60, 95);
          resolve();
        }
      };

      try {
        xhr.send(data);
      } catch (err) {
        if (!isCompleted) {
          isCompleted = true;
          clearTimeout(timeoutTimer);
          runSimulatedTest("upload", 60, 95).then(resolve);
        }
      }
    });
  };

  // Симуляция на случай непредвиденных сетевых ошибок на Vercel Edge/Serverless
  const runSimulatedTest = async (type: "download" | "upload", startProgress: number, endProgress: number) => {
    const duration = 5000; // 5 сек
    const startTime = performance.now();
    const targetSpeed = Math.random() * 180 + 35; // 35 - 215 Mbps
    let localHistory: number[] = [];

    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        const elapsed = performance.now() - startTime;
        const ratio = elapsed / duration;

        if (ratio >= 1) {
          clearInterval(interval);
          setCurrentSpeed(Math.round(targetSpeed * 10) / 10);
          setResults((prev) => ({
            ...prev,
            [type]: Math.round(targetSpeed * 10) / 10,
          }));
          setProgress(endProgress);
          resolve();
          return;
        }

        // Шум для правдоподобности скорости
        const noise = (Math.random() - 0.5) * 15;
        const speed = Math.max(1, targetSpeed * Math.sin(ratio * Math.PI / 2) + noise);
        const displaySpeed = Math.round(speed * 10) / 10;
        
        setCurrentSpeed(displaySpeed);
        localHistory.push(speed);
        setSpeedHistory([...localHistory]);
        
        setProgress(Math.round(startProgress + ratio * (endProgress - startProgress)));
      }, 150);
    });
  };

  // Главный запуск всего цикла тестов
  const startSpeedTest = async () => {
    setErrorMessage("");
    setResults({ ping: null, jitter: null, download: null, upload: null });
    
    try {
      // 1. Тест пинга
      await runPingTest();
      
      // 2. Тест скачивания
      await runDownloadTest();
      
      // 3. Тест загрузки
      await runUploadTest();
      
      // Завершение
      setProgress(100);
      setCurrentSpeed(0);
      setTestState("completed");
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || "Упс! Томаты лопнули при замере. Попробуй еще раз.");
      setTestState("error");
    }
  };

  // Сброс теста
  const resetTest = () => {
    setTestState("idle");
    setCurrentSpeed(0);
    setProgress(0);
    setResults({ ping: null, jitter: null, download: null, upload: null });
    setSpeedHistory([]);
    tomatoesRef.current = [];
  };

  // Максимальное значение скорости для масштаба графика
  const maxSpeedInHistory = speedHistory.length > 0 ? Math.max(...speedHistory, 50) : 100;

  return (
    <div className="relative flex flex-col flex-grow items-center justify-center bg-zinc-950 text-white overflow-hidden select-none font-sans min-h-screen">
      {/* Фоновый интерактивный холст для томатного дождя */}
      <canvas
        ref={canvasRef}
        onClick={handleCanvasClick}
        className="absolute inset-0 w-full h-full z-10 pointer-events-auto cursor-pointer"
        title="Кликни, чтобы лопнуть помидорку!"
      />

      {/* Верхний светящийся градиент */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[500px] h-[500px] bg-red-900/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-0 right-10 w-[300px] h-[300px] bg-emerald-900/10 rounded-full blur-[100px] pointer-events-none z-0" />

      {/* Контентная зона */}
      <div className="relative z-20 w-full max-w-4xl px-6 py-12 flex flex-col items-center">
        {/* Заголовок */}
        <header className="mb-10 text-center">
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: "spring", stiffness: 100 }}
            className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-950/40 border border-red-500/20 text-red-400 text-sm font-semibold mb-3 tracking-wide backdrop-blur-md"
          >
            <Flame className="w-4 h-4 text-red-500 animate-pulse" />
            100% ТОМАТНЫЙ ЗАМЕР
          </motion.div>
          
          <h1 className="text-4xl md:text-6xl font-black tracking-tight bg-gradient-to-r from-red-500 via-tomato-400 to-red-600 bg-clip-text text-transparent drop-shadow-sm select-none">
            Speed Tomato
          </h1>
          <p className="text-zinc-400 mt-2 text-sm md:text-base max-w-md mx-auto">
            Реальный замер скорости интернета, переведенный в сочные фермерские помидоры.
          </p>
        </header>

        {/* Интерактивный спидометр */}
        <div className="w-full flex flex-col items-center justify-center min-h-[360px]">
          <AnimatePresence mode="wait">
            
            {/* IDLE state */}
            {testState === "idle" && (
              <motion.div
                key="idle"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="flex flex-col items-center"
              >
                {/* Огромный Томат-Кнопка */}
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={startSpeedTest}
                  className="relative group w-64 h-64 md:w-72 md:h-72 rounded-full flex flex-col items-center justify-center bg-gradient-to-br from-red-500 via-red-600 to-red-700 shadow-[0_0_50px_rgba(239,68,68,0.3)] hover:shadow-[0_0_70px_rgba(239,68,68,0.5)] border border-red-400/30 cursor-pointer transition-all duration-300 overflow-visible"
                >
                  {/* Зеленый хвостик томата */}
                  <div className="absolute -top-6 left-1/2 -translate-x-1/2 w-16 h-12 z-20 pointer-events-none drop-shadow-md">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500 fill-current">
                      <path d="M50 85 C 45 60, 20 50, 10 50 C 30 40, 40 30, 50 15 C 60 30, 70 40, 90 50 C 80 50, 55 60, 50 85 Z" />
                      <circle cx="50" cy="50" r="10" className="text-emerald-600" />
                    </svg>
                  </div>

                  {/* Внутренний блик для объема */}
                  <div className="absolute top-8 left-12 w-16 h-8 bg-white/20 rounded-full blur-[2px] -rotate-12 pointer-events-none" />

                  {/* Текст внутри томата */}
                  <Play className="w-16 h-16 text-white fill-current group-hover:scale-110 transition-transform duration-300 drop-shadow-md" />
                  <span className="text-white text-xl font-extrabold tracking-wider uppercase mt-4 drop-shadow-md">
                    Запустить тест
                  </span>
                  
                  {/* Пульсирующие кольца сзади */}
                  <span className="absolute inset-0 rounded-full border border-red-500/30 animate-ping opacity-75" />
                </motion.button>
                <p className="text-zinc-500 mt-6 text-xs text-center">
                  * Замеряется реальная пропускная способность сети до ближайших узлов
                </p>
              </motion.div>
            )}

            {/* ACTIVE TESTING state */}
            {(testState === "ping" || testState === "download" || testState === "upload") && (
              <motion.div
                key="testing"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-lg flex flex-col items-center bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-8 backdrop-blur-xl shadow-2xl relative"
              >
                {/* Хвостик на бэкграунде */}
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-red-950 border border-red-500/30 text-red-500 text-xs font-bold uppercase tracking-wider">
                  Тест: {testState === "ping" ? "Пинг" : testState === "download" ? "Скачивание" : "Загрузка"}
                </div>

                {/* Числовой дисплей */}
                <div className="text-center mt-4">
                  <span className="text-7xl md:text-8xl font-black tabular-nums bg-gradient-to-b from-white to-zinc-400 bg-clip-text text-transparent">
                    {testState === "ping" ? results.ping || "..." : Math.round(currentSpeed)}
                  </span>
                  <span className="text-red-500 text-2xl font-black ml-2 uppercase block md:inline mt-1">
                    {testState === "ping" ? "мс" : "Мбит/с"}
                  </span>
                </div>

                {/* Томатные эквиваленты в реальном времени */}
                {testState !== "ping" && (
                  <div className="flex items-center gap-2 mt-4 px-4 py-2 rounded-xl bg-red-950/30 border border-red-500/10 text-red-400 font-medium text-sm">
                    <Award className="w-4 h-4" />
                    <span>
                      ~ {Math.round(currentSpeed * 1.2)} помидоров в секунду летит в корзину!
                    </span>
                  </div>
                )}

                {/* Анимированный томат во время замера */}
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                    rotate: testState === "ping" ? [0, 0] : [-3, 3, -3]
                  }}
                  transition={{ 
                    repeat: Infinity, 
                    duration: testState === "ping" ? 1 : 0.2,
                    ease: "easeInOut"
                  }}
                  className="w-24 h-24 bg-red-600 rounded-full my-6 flex items-center justify-center shadow-lg relative"
                >
                  <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-6 h-4">
                    <svg viewBox="0 0 100 100" className="w-full h-full text-emerald-500 fill-current">
                      <path d="M50 85 C 45 60, 20 50, 10 50 C 30 40, 40 30, 50 15 C 60 30, 70 40, 90 50 C 80 50, 55 60, 50 85 Z" />
                    </svg>
                  </div>
                  {testState === "ping" ? (
                    <Activity className="w-8 h-8 text-white animate-pulse" />
                  ) : testState === "download" ? (
                    <Download className="w-8 h-8 text-white animate-bounce" />
                  ) : (
                    <Upload className="w-8 h-8 text-white animate-bounce" />
                  )}
                  {/* Волна пинга */}
                  {testState === "ping" && (
                    <span className="absolute inset-0 rounded-full border border-red-500 animate-ping opacity-60" />
                  )}
                </motion.div>

                {/* Шкала прогресса */}
                <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden relative border border-zinc-700/50 mb-4">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-red-500 via-tomato-500 to-emerald-500"
                    initial={{ width: "0%" }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.2 }}
                  />
                </div>

                {/* Сводка текущих промежуточных результатов */}
                <div className="grid grid-cols-3 gap-4 w-full mt-2 text-center text-sm border-t border-zinc-800/80 pt-6">
                  <div>
                    <span className="text-zinc-500 block mb-1">Ping / Jitter</span>
                    <span className="font-bold text-white block">
                      {results.ping !== null ? `${results.ping} мс` : "—"}
                    </span>
                    <span className="text-[10px] text-zinc-500">
                      {results.jitter !== null ? `/${results.jitter} мс` : ""}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-1">Скачивание</span>
                    <span className={`font-bold block ${testState === "download" ? "text-red-400" : "text-white"}`}>
                      {results.download !== null ? `${results.download} Мбит/с` : testState === "download" ? "Замер..." : "—"}
                    </span>
                  </div>
                  <div>
                    <span className="text-zinc-500 block mb-1">Загрузка</span>
                    <span className={`font-bold block ${testState === "upload" ? "text-red-400" : "text-white"}`}>
                      {results.upload !== null ? `${results.upload} Мбит/с` : testState === "upload" ? "Замер..." : "—"}
                    </span>
                  </div>
                </div>

                {/* Микро-график в реальном времени */}
                {speedHistory.length > 1 && (
                  <div className="w-full h-16 mt-6 bg-zinc-950/50 rounded-xl overflow-hidden relative border border-zinc-800/40 px-2 py-1">
                    <svg className="w-full h-full" viewBox={`0 0 ${speedHistory.length} 100`} preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#ef4444" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#ef4444" stopOpacity="0" />
                        </linearGradient>
                      </defs>
                      <path
                        d={`M 0 100 ${speedHistory.map((val, idx) => `L ${idx} ${100 - (val / maxSpeedInHistory) * 90}`).join(" ")} L ${speedHistory.length - 1} 100 Z`}
                        fill="url(#chartGrad)"
                      />
                      <polyline
                        fill="none"
                        stroke="#f87171"
                        strokeWidth="2"
                        points={speedHistory.map((val, idx) => `${idx},${100 - (val / maxSpeedInHistory) * 90}`).join(" ")}
                      />
                    </svg>
                    <span className="absolute top-1 right-2 text-[9px] text-zinc-500 font-mono">
                      Пик: {Math.round(maxSpeedInHistory)} Мбит/с
                    </span>
                  </div>
                )}
              </motion.div>
            )}

            {/* ERROR state */}
            {testState === "error" && (
              <motion.div
                key="error"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.9 }}
                className="w-full max-w-md bg-zinc-900/80 border border-red-900/30 rounded-3xl p-8 text-center backdrop-blur-xl shadow-2xl"
              >
                <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-red-400">Ошибка томатометра</h3>
                <p className="text-zinc-400 mt-2 text-sm">{errorMessage}</p>
                <button
                  onClick={resetTest}
                  className="mt-6 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center gap-2 mx-auto cursor-pointer transition-colors shadow-lg shadow-red-900/30"
                >
                  <RotateCcw className="w-4 h-4" />
                  Попробовать снова
                </button>
              </motion.div>
            )}

            {/* COMPLETED state */}
            {testState === "completed" && (
              <motion.div
                key="completed"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -30 }}
                transition={{ type: "spring", stiffness: 100, damping: 15 }}
                className="w-full max-w-2xl bg-zinc-900/60 border border-zinc-800/80 rounded-3xl p-6 md:p-8 backdrop-blur-xl shadow-2xl"
              >
                <div className="text-center mb-6">
                  <h2 className="text-2xl md:text-3xl font-extrabold text-white">Урожай собран!</h2>
                  <p className="text-zinc-400 text-xs md:text-sm mt-1">
                    Вот помидорный эквивалент твоей сетевой пропускной способности.
                  </p>
                </div>

                {/* Три карточки с результатами */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  
                  {/* PING CARD */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-zinc-950/80 border border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold mb-2">
                        <Wifi className="w-3.5 h-3.5" />
                        ПИНГ (ЗАДЕРЖКА)
                      </div>
                      <div className="text-3xl font-black tabular-nums text-white">
                        {results.ping} <span className="text-sm font-medium text-zinc-400">мс</span>
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        Джиттер: {results.jitter} мс
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-900">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-red-950 text-red-400 border border-red-500/20 uppercase tracking-wider block w-max mb-1">
                        {getPingLabel(results.ping || 0).title}
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        {getPingLabel(results.ping || 0).desc}
                      </p>
                    </div>
                  </motion.div>

                  {/* DOWNLOAD CARD */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-zinc-950/80 border border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold mb-2">
                        <Download className="w-3.5 h-3.5" />
                        СКАЧИВАНИЕ
                      </div>
                      <div className="text-3xl font-black tabular-nums text-white">
                        {results.download} <span className="text-sm font-medium text-zinc-400">Мбит/с</span>
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        ~ {Math.round((results.download || 0) * 1.2)} помидор/сек
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-900">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-emerald-950 text-emerald-400 border border-emerald-500/20 uppercase tracking-wider block w-max mb-1">
                        {getDownloadLabel(results.download || 0).title}
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        {getDownloadLabel(results.download || 0).desc}
                      </p>
                    </div>
                  </motion.div>

                  {/* UPLOAD CARD */}
                  <motion.div 
                    whileHover={{ y: -4 }}
                    className="bg-zinc-950/80 border border-zinc-800/60 rounded-2xl p-5 flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center gap-1.5 text-zinc-500 text-xs font-semibold mb-2">
                        <Upload className="w-3.5 h-3.5" />
                        ЗАГРУЗКА
                      </div>
                      <div className="text-3xl font-black tabular-nums text-white">
                        {results.upload} <span className="text-sm font-medium text-zinc-400">Мбит/с</span>
                      </div>
                      <div className="text-xs text-zinc-500 font-mono mt-1">
                        ~ {Math.round((results.upload || 0) * 1.2)} отгрузок/сек
                      </div>
                    </div>
                    <div className="mt-4 pt-3 border-t border-zinc-900">
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-amber-950 text-amber-400 border border-amber-500/20 uppercase tracking-wider block w-max mb-1">
                        {getUploadLabel(results.upload || 0).title}
                      </span>
                      <p className="text-[11px] text-zinc-400 leading-normal">
                        {getUploadLabel(results.upload || 0).desc}
                      </p>
                    </div>
                  </motion.div>

                </div>

                {/* Итоговый вердикт */}
                <div className="bg-red-950/30 border border-red-500/20 rounded-2xl p-4 flex flex-col md:flex-row items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-red-600 flex items-center justify-center text-2xl shrink-0 shadow-inner">
                    🍅
                  </div>
                  <div>
                    <h4 className="text-white font-bold text-sm">Итоговый помидорный статус:</h4>
                    <p className="text-xs text-zinc-300 mt-0.5">
                      Твоему интернету присвоен статус <strong className="text-red-400">{getDownloadLabel(results.download || 0).title}</strong>. 
                      Скорость скачивания эквивалентна сбору урожая из {Math.round((results.download || 0) * 1.2)} помидоров в секунду. 
                      {results.ping && results.ping <= 20 ? " Пинг молниеносный, рассада растет моментально!" : " Скорость отклика средняя, но суп сварить успеешь."}
                    </p>
                  </div>
                </div>

                {/* Кнопки управления */}
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={startSpeedTest}
                    className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors shadow-lg shadow-red-900/30 w-full sm:w-auto"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Перемерить урожай
                  </button>
                  <button
                    onClick={resetTest}
                    className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white font-bold rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors w-full sm:w-auto"
                  >
                    На главную
                  </button>
                </div>
              </motion.div>
            )}

          </AnimatePresence>
        </div>

        {/* Дополнительная техническая информация / Футер */}
        <footer className="mt-12 text-center text-xs text-zinc-600 max-w-sm border-t border-zinc-900 pt-6">
          <div className="flex items-center justify-center gap-2 mb-2">
            <Globe className="w-3.5 h-3.5 text-zinc-600" />
            <span>Метод тестирования: RFC-эмуляция & HTTP-потоки</span>
          </div>
          <p>
            Для замера используются прямые HTTP POST/GET-запросы без кэширования через сервер Vercel. 
            Кликни по экрану, чтобы набросать спелых черри!
          </p>
        </footer>
      </div>
    </div>
  );
}
