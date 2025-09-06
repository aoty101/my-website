    const baseSize = 16;
    function setRem() {
        const _screen = window.screen.width;
        if (_screen < 1920) {
            const scale = _screen / 1920;
            // 设置页面根节点字体大小（ Math.min(scale, 2)指最高放大比例为2，可根据实际业务需求调整 ）
            document.documentElement.style.fontSize = baseSize * Math.min(scale, 2) + 'px';
        }
    }
 
    setRem();
 
    window.onresize = function() {
        setRem();
    };