(function() {
  var canvas = document.getElementById('fx');
  if (!canvas) return;
  var ctx = canvas.getContext('2d');
  var w, h, dpr;
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  function resize() {
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    canvas.width = w * dpr;
    canvas.height = h * dpr;
    canvas.style.width = w + 'px';
    canvas.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();
  window.addEventListener('resize', resize);

  if (reduceMotion) return;

  var embers = [];
  var EMBER_COUNT = Math.min(28, Math.floor(w / 40));

  function spawnEmber() {
    return {
      x: Math.random() * w,
      y: h + Math.random() * 100,
      r: 1 + Math.random() * 2,
      speed: 0.2 + Math.random() * 0.45,
      drift: (Math.random() - 0.5) * 0.35,
      flicker: Math.random() * Math.PI * 2,
      hueShift: Math.random()
    };
  }
  for (var i = 0; i < EMBER_COUNT; i++) {
    var e = spawnEmber();
    e.y = Math.random() * h;
    embers.push(e);
  }

  var lightningTimer = 0;
  var nextStrike = 3000 + Math.random() * 5000;
  var boltSeed = null;

  function makeBolt(corner) {
    var pts = [];
    var startX = corner === 'left' ? -20 : w + 20;
    var startY = Math.random() * h * 0.4;
    var x = startX, y = startY;
    var dirX = corner === 'left' ? 1 : -1;
    pts.push({x: x, y: y});
    var segments = 6 + Math.floor(Math.random() * 4);
    for (var s = 0; s < segments; s++) {
      x += dirX * (40 + Math.random() * 70);
      y += (Math.random() - 0.3) * 90;
      pts.push({x: x, y: y});
    }
    return pts;
  }

  function drawBolt(pts, alpha) {
    ctx.save();
    ctx.strokeStyle = 'rgba(150, 200, 255, ' + alpha + ')';
    ctx.lineWidth = 1.3;
    ctx.shadowColor = 'rgba(79,163,255,0.8)';
    ctx.shadowBlur = 12;
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (var i = 1; i < pts.length; i++) ctx.lineTo(pts[i].x, pts[i].y);
    ctx.stroke();
    ctx.restore();
  }

  var lastTime = performance.now();

  function tick(now) {
    var dt = now - lastTime;
    lastTime = now;
    ctx.clearRect(0, 0, w, h);

    ctx.save();
    for (var i = 0; i < embers.length; i++) {
      var em = embers[i];
      em.y -= em.speed;
      em.x += em.drift;
      em.flicker += 0.05;
      if (em.y < -10) {
        embers[i] = spawnEmber();
        embers[i].y = h + 10;
        continue;
      }
      var flick = 0.5 + 0.5 * Math.sin(em.flicker);
      var alpha = 0.2 + flick * 0.3;
      var grad = ctx.createRadialGradient(em.x, em.y, 0, em.x, em.y, em.r * 4);
      grad.addColorStop(0, 'rgba(255, ' + (120 + em.hueShift * 60) + ', 60, ' + alpha + ')');
      grad.addColorStop(1, 'rgba(255, 61, 31, 0)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(em.x, em.y, em.r * 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();

    lightningTimer += dt;
    if (lightningTimer > nextStrike) {
      lightningTimer = 0;
      nextStrike = 4000 + Math.random() * 6000;
      boltSeed = {
        bolt: makeBolt(Math.random() < 0.5 ? 'left' : 'right'),
        life: 0,
        maxLife: 220 + Math.random() * 120
      };
    }
    if (boltSeed) {
      boltSeed.life += dt;
      var t = boltSeed.life / boltSeed.maxLife;
      if (t < 1) {
        var a = t < 0.15 ? t / 0.15 : (1 - (t - 0.15) / 0.85);
        drawBolt(boltSeed.bolt, Math.max(0, a * 0.6));
      } else {
        boltSeed = null;
      }
    }

    requestAnimationFrame(tick);
  }
  requestAnimationFrame(tick);
})();

/* Mobile nav toggle */
document.addEventListener('DOMContentLoaded', function() {
  var toggle = document.querySelector('.nav-toggle');
  var nav = document.querySelector('.main-nav');
  if (!toggle || !nav) return;
  toggle.addEventListener('click', function() {
    var open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function(a) {
    a.addEventListener('click', function() {
      nav.classList.remove('open');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
});
