(function () {
    'use strict';

    /* ---- HERO CANVAS — EGYPTIAN PYRAMID SCENE ---- */
    const canvas = document.getElementById('heroCanvas');
    const ctx = canvas.getContext('2d');
    let cw, ch;

    function resizeCanvas() {
        cw = canvas.width = canvas.offsetWidth;
        ch = canvas.height = canvas.offsetHeight;
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Stars
    const stars = [];
    for (let i = 0; i < 140; i++) {
        stars.push({
            x: Math.random(),
            y: Math.random() * 0.72,
            r: Math.random() * 1.3 + 0.2,
            alpha: Math.random() * 0.55 + 0.15,
            twinkle: Math.random() * Math.PI * 2,
            speed: 0.012 + Math.random() * 0.022
        });
    }

    // Sand particles drifting with the desert wind
    const sand = [];
    for (let i = 0; i < 70; i++) {
        sand.push({
            x: Math.random(),
            y: 0.66 + Math.random() * 0.34,
            vx: 0.00025 + Math.random() * 0.00035,
            vy: (Math.random() - 0.5) * 0.0001,
            r: Math.random() * 1.4 + 0.3,
            alpha: Math.random() * 0.22 + 0.04
        });
    }

    let glowT = 0;
    let hazeT = 0;

    function drawPyramids() {
        ctx.clearRect(0, 0, cw, ch);

        const groundY = ch * 0.71;

        // Sky — deep warm amber gradient
        const sky = ctx.createLinearGradient(0, 0, 0, ch);
        sky.addColorStop(0, '#030100');
        sky.addColorStop(0.38, '#100700');
        sky.addColorStop(0.70, '#1e0d02');
        sky.addColorStop(1, '#080400');
        ctx.fillStyle = sky;
        ctx.fillRect(0, 0, cw, ch);

        // Atmospheric haze band at horizon
        hazeT += 0.003;
        const hazeOff = Math.sin(hazeT) * 0.02;
        const haze = ctx.createLinearGradient(0, groundY - ch * (0.18 + hazeOff), 0, groundY + ch * 0.06);
        haze.addColorStop(0, 'rgba(0,0,0,0)');
        haze.addColorStop(0.5, 'rgba(80, 32, 4, 0.18)');
        haze.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = haze;
        ctx.fillRect(0, 0, cw, ch);

        // Stars — twinkling
        stars.forEach(s => {
            s.twinkle += s.speed;
            const a = s.alpha * (0.45 + 0.55 * Math.abs(Math.sin(s.twinkle)));
            ctx.globalAlpha = a;
            ctx.fillStyle = '#f5dfa0';
            ctx.beginPath();
            ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        // Ground — dark sandy floor
        const gnd = ctx.createLinearGradient(0, groundY, 0, ch);
        gnd.addColorStop(0, '#1c0e03');
        gnd.addColorStop(1, '#050300');
        ctx.fillStyle = gnd;
        ctx.fillRect(0, groundY, cw, ch - groundY);

        // Main glow — pulsing warm light at pyramid base
        glowT += 0.007;
        const gi = 0.52 + 0.10 * Math.sin(glowT);
        const gx = cw * 0.415, gy = groundY;

        const glow = ctx.createRadialGradient(gx, gy, 0, gx, gy, cw * 0.40);
        glow.addColorStop(0, `rgba(255, 185, 55, ${gi})`);
        glow.addColorStop(0.18, `rgba(230, 100, 18, ${gi * 0.38})`);
        glow.addColorStop(0.45, `rgba(180, 65, 8, ${gi * 0.12})`);
        glow.addColorStop(1, 'rgba(0,0,0,0)');
        ctx.fillStyle = glow;
        ctx.fillRect(0, 0, cw, ch);

        // Intense core flare
        const core = ctx.createRadialGradient(gx, gy, 0, gx, gy, cw * 0.055);
        core.addColorStop(0, `rgba(255, 248, 200, ${gi * 0.85})`);
        core.addColorStop(0.5, `rgba(255, 190, 60, ${gi * 0.4})`);
        core.addColorStop(1, 'rgba(255,150,30,0)');
        ctx.fillStyle = core;
        ctx.fillRect(0, 0, cw, ch);

        // === PYRAMID SILHOUETTES (back to front) ===

        // Center pyramid — tallest, furthest back
        const p2g = ctx.createLinearGradient(cw * 0.50, ch * 0.07, cw * 0.50, groundY);
        p2g.addColorStop(0, '#190b03');
        p2g.addColorStop(0.7, '#241308');
        p2g.addColorStop(1, '#2e1809');
        ctx.fillStyle = p2g;
        ctx.beginPath();
        ctx.moveTo(cw * 0.500, ch * 0.07);
        ctx.lineTo(cw * 0.265, groundY);
        ctx.lineTo(cw * 0.735, groundY);
        ctx.closePath();
        ctx.fill();

        // Right pyramid — medium, partially visible
        const p3g = ctx.createLinearGradient(cw * 0.80, ch * 0.30, cw * 0.80, groundY);
        p3g.addColorStop(0, '#140903');
        p3g.addColorStop(1, '#201005');
        ctx.fillStyle = p3g;
        ctx.beginPath();
        ctx.moveTo(cw * 0.800, ch * 0.29);
        ctx.lineTo(cw * 0.635, groundY);
        ctx.lineTo(cw * 0.970, groundY);
        ctx.closePath();
        ctx.fill();

        // Left pyramid — large, closest, most lit
        const p1g = ctx.createLinearGradient(cw * 0.255, ch * 0.16, cw * 0.255, groundY);
        p1g.addColorStop(0, '#1e0d04');
        p1g.addColorStop(0.55, '#180b04');
        p1g.addColorStop(1, '#3a1c08');
        ctx.fillStyle = p1g;
        ctx.beginPath();
        ctx.moveTo(cw * 0.255, ch * 0.16);
        ctx.lineTo(cw * (-0.015), groundY);
        ctx.lineTo(cw * 0.540, groundY);
        ctx.closePath();
        ctx.fill();

        // Small ruined mound — between left and center base
        ctx.fillStyle = '#1a0b04';
        ctx.beginPath();
        ctx.moveTo(cw * 0.405, groundY - ch * 0.075);
        ctx.lineTo(cw * 0.335, groundY);
        ctx.lineTo(cw * 0.480, groundY);
        ctx.closePath();
        ctx.fill();

        // Faint warm rim light on left pyramid edge (from the glow)
        ctx.save();
        ctx.globalAlpha = 0.13 + 0.04 * Math.sin(glowT * 1.3);
        ctx.strokeStyle = '#8E1616';
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(cw * 0.255, ch * 0.16);
        ctx.lineTo(cw * 0.540, groundY);
        ctx.stroke();
        ctx.restore();

        // Re-draw ground on top to cover pyramid bases cleanly
        const gnd2 = ctx.createLinearGradient(0, groundY + ch * 0.04, 0, ch);
        gnd2.addColorStop(0, '#120800');
        gnd2.addColorStop(1, '#040200');
        ctx.fillStyle = gnd2;
        ctx.fillRect(0, groundY + ch * 0.04, cw, ch);

        // Sand particles drifting
        sand.forEach(s => {
            s.x += s.vx;
            s.y += s.vy;
            if (s.x > 1.05) s.x = -0.05;
            if (s.y > 1.0) s.y = 0.66;
            if (s.y < 0.64) s.y = 0.66;
            ctx.globalAlpha = s.alpha;
            ctx.fillStyle = '#8E1616';
            ctx.beginPath();
            ctx.arc(s.x * cw, s.y * ch, s.r, 0, Math.PI * 2);
            ctx.fill();
        });
        ctx.globalAlpha = 1;

        requestAnimationFrame(drawPyramids);
    }
    drawPyramids();

})();