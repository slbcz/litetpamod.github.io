(function() {
  const canvas = document.getElementById('fluid-canvas');
  if (!canvas) return;

  // 检查 Canvas 2D 支持
  if (typeof canvas.getContext !== 'function') {
    disableFluid();
    return;
  }

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    disableFluid();
    return;
  }

  let width, height;
  let particles = [];
  const particleCount = 60;
  const connectionDistance = 160;
  const mouse = { x: -1000, y: -1000 };

  // 初始化粒子
  function createParticles() {
    particles = [];
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.6,
        vy: (Math.random() - 0.5) * 0.6,
        radius: Math.random() * 3 + 1.5,
        opacity: Math.random() * 0.25 + 0.08,
      });
    }
  }

  // 调整画布大小
  function resize() {
    width = window.innerWidth;
    height = window.innerHeight;
    canvas.width = width;
    canvas.height = height;
    createParticles();
  }

  // 绘制
  function draw() {
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);

    // 更新并绘制粒子
    for (let i = 0; i < particles.length; i++) {
      const p = particles[i];

      // 移动
      p.x += p.vx;
      p.y += p.vy;

      // 边界反弹
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      // 鼠标交互（微弱吸引/排斥）
      const dx = mouse.x - p.x;
      const dy = mouse.y - p.y;
      const distToMouse = Math.sqrt(dx * dx + dy * dy);
      if (distToMouse < 200 && distToMouse > 1) {
        const force = 0.02;
        p.vx += (dx / distToMouse) * force;
        p.vy += (dy / distToMouse) * force;
      }

      // 速度衰减
      p.vx *= 0.998;
      p.vy *= 0.998;

      // 限制最大速度
      const maxSpeed = 1.2;
      const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
      if (speed > maxSpeed) {
        p.vx = (p.vx / speed) * maxSpeed;
        p.vy = (p.vy / speed) * maxSpeed;
      }

      // 绘制粒子
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(2, 157, 247, ${p.opacity})`;
      ctx.fill();
    }

    // 绘制连线
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const a = particles[i];
        const b = particles[j];
        const dx = a.x - b.x;
        const dy = a.y - b.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < connectionDistance) {
          const alpha = (1 - dist / connectionDistance) * 0.12;
          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = `rgba(2, 157, 247, ${alpha})`;
          ctx.lineWidth = 0.6;
          ctx.stroke();
        }
      }
    }

    requestAnimationFrame(draw);
  }

  // 鼠标移动
  function onMouseMove(e) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  // 触摸移动
  function onTouchMove(e) {
    if (e.touches.length > 0) {
      mouse.x = e.touches[0].clientX;
      mouse.y = e.touches[0].clientY;
    }
  }

  // 禁用流体效果，显示备用渐变
  function disableFluid() {
    const fluidBg = document.querySelector('.fluid-background');
    const fallback = document.querySelector('.fallback-gradient');
    if (fluidBg) fluidBg.style.display = 'none';
    if (fallback) fallback.style.display = 'block';
  }

  // 启动
  function init() {
    try {
      resize();
      draw();
      window.addEventListener('resize', resize);
      window.addEventListener('mousemove', onMouseMove);
      window.addEventListener('touchmove', onTouchMove, { passive: true });
    } catch (e) {
      disableFluid();
    }
  }

  // 检测是否在初始化后2秒内开始渲染（粗略判断是否成功）
  const initTimeout = setTimeout(() => {
    // 如果画布仍然是初始状态，视为失败
    if (particles.length === 0) {
      disableFluid();
    }
  }, 3000);

  init();
})();