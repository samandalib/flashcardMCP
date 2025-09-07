#!/bin/bash

# Create a simple script to generate basic icons
# This will create placeholder icons that can be replaced with proper designs later

# Create a simple HTML file to generate icons using canvas
cat > generate_icons.html << 'EOF'
<!DOCTYPE html>
<html>
<head>
    <title>Icon Generator</title>
</head>
<body>
    <canvas id="canvas" width="512" height="512" style="display: none;"></canvas>
    <script>
        const canvas = document.getElementById('canvas');
        const ctx = canvas.getContext('2d');
        
        const sizes = [72, 96, 128, 144, 152, 192, 384, 512];
        
        sizes.forEach(size => {
            // Create a new canvas for each size
            const iconCanvas = document.createElement('canvas');
            iconCanvas.width = size;
            iconCanvas.height = size;
            const iconCtx = iconCanvas.getContext('2d');
            
            // Create gradient background
            const gradient = iconCtx.createLinearGradient(0, 0, size, size);
            gradient.addColorStop(0, '#3b82f6');
            gradient.addColorStop(1, '#1d4ed8');
            
            // Draw background circle
            iconCtx.fillStyle = gradient;
            iconCtx.beginPath();
            iconCtx.arc(size/2, size/2, size/2 - 4, 0, 2 * Math.PI);
            iconCtx.fill();
            
            // Draw border
            iconCtx.strokeStyle = '#1e40af';
            iconCtx.lineWidth = 2;
            iconCtx.stroke();
            
            // Draw flashcard
            const cardWidth = size * 0.6;
            const cardHeight = size * 0.4;
            const cardX = (size - cardWidth) / 2;
            const cardY = (size - cardHeight) / 2;
            
            iconCtx.fillStyle = 'white';
            iconCtx.fillRect(cardX, cardY, cardWidth, cardHeight);
            
            // Draw card border
            iconCtx.strokeStyle = '#e5e7eb';
            iconCtx.lineWidth = 1;
            iconCtx.strokeRect(cardX, cardY, cardWidth, cardHeight);
            
            // Draw tabs
            const tabWidth = cardWidth * 0.15;
            const tabHeight = cardHeight * 0.2;
            const tabY = cardY - tabHeight;
            
            // Blue tab
            iconCtx.fillStyle = '#3b82f6';
            iconCtx.fillRect(cardX, tabY, tabWidth, tabHeight);
            
            // Green tab
            iconCtx.fillStyle = '#10b981';
            iconCtx.fillRect(cardX + tabWidth, tabY, tabWidth, tabHeight);
            
            // Purple tab
            iconCtx.fillStyle = '#8b5cf6';
            iconCtx.fillRect(cardX + tabWidth * 2, tabY, tabWidth, tabHeight);
            
            // Draw content lines
            iconCtx.fillStyle = '#6b7280';
            const lineHeight = size * 0.02;
            const lineSpacing = size * 0.03;
            
            for (let i = 0; i < 3; i++) {
                const lineY = cardY + cardHeight * 0.3 + i * lineSpacing;
                const lineWidth = cardWidth * (0.8 - i * 0.1);
                iconCtx.fillRect(cardX + cardWidth * 0.1, lineY, lineWidth, lineHeight);
            }
            
            // Convert to blob and download
            iconCanvas.toBlob(blob => {
                const url = URL.createObjectURL(blob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `icon-${size}x${size}.png`;
                a.click();
                URL.revokeObjectURL(url);
            });
        });
        
        console.log('Icons generated! Check your downloads folder.');
    </script>
</body>
</html>
EOF

echo "Icon generator HTML created. Open generate_icons.html in your browser to generate icons."
