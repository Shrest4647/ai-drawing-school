/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
/* tslint:disable */
import {Content, GoogleGenAI, Modality} from '@google/genai';
import {
  ChevronDown,
  Download,
  Droplet,
  Eraser,
  Import,
  ShareIcon,
  LoaderCircle,
  Maximize,
  PaintBucket,
  Paintbrush,
  Redo2,
  Scan,
  BoxSelect,
  SendHorizontal,
  Spline,
  Trash2,
  Type,
  Undo2,
  X,
  ZoomIn,
  ZoomOut,
} from 'lucide-react';
import {useEffect, useRef, useState} from 'react';

const ai = new GoogleGenAI({apiKey: process.env.GEMINI_API_KEY});

function parseError(error: string) {
  const regex = /{"error":(.*)}/gm;
  const m = regex.exec(error);
  try {
    const e = m[1];
    const err = JSON.parse(e);
    return err.message || error;
  } catch (e) {
    return error;
  }
}

type Tool = 'pen' | 'eraser' | 'text' | 'selector' | 'bucket';
type BrushType = 'solid' | 'watercolor';

export default function Home() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const colorInputRef = useRef<HTMLInputElement>(null);
  const importInputRef = useRef<HTMLInputElement>(null);
  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [isDrawing, setIsDrawing] = useState(false);
  const [penColor, setPenColor] = useState('#000000');
  const [prompt, setPrompt] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [customApiKey, setCustomApiKey] = useState('');
  const [selectedModel, setSelectedModel] = useState(
    'gemini-2.5-flash-image-preview',
  );
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const [activeTool, setActiveTool] = useState<Tool>('pen');
  const [brushType, setBrushType] = useState<BrushType>('solid');
  const [brushSize, setBrushSize] = useState(5);
  const [smoothness, setSmoothness] = useState(5); // Range 0-9

  // Text tool state
  const [isEditingText, setIsEditingText] = useState(false);
  const [textInput, setTextInput] = useState({value: '', x: 0, y: 0});
  const [fontFamily, setFontFamily] = useState('Arial');
  const [fontSize, setFontSize] = useState(24);

  // Zoom and Pan state
  const [scale, setScale] = useState(1);
  const [offset, setOffset] = useState({x: 0, y: 0});
  const [isPanning, setIsPanning] = useState(false);
  const [isSpacePressed, setIsSpacePressed] = useState(false);
  const lastPanPointRef = useRef({x: 0, y: 0});

  // Selector tool state
  const [isSelecting, setIsSelecting] = useState(false);
  const [isMovingSelection, setIsMovingSelection] = useState(false);
  const [selectionRect, setSelectionRect] = useState(null);
  const [selectionImageData, setSelectionImageData] = useState(null);
  const [originalSelectionPos, setOriginalSelectionPos] = useState(null);
  const startPointRef = useRef({x: 0, y: 0});

  // Refs for smoothed drawing
  const pointsRef = useRef([]);
// Redraw canvas based on current state (history, zoom, pan)
  const redrawCanvas = () => {
    if (!canvasRef.current || historyIndex < 0) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const dataUrl = history[historyIndex];

    const img = new window.Image();
    img.onload = () => {
      // Clear canvas without transform
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Apply pan and zoom
      ctx.save();
      ctx.translate(offset.x, offset.y);
      ctx.scale(scale, scale);

      // Draw the saved state
      ctx.drawImage(img, 0, 0);

    const drawOperations = () => {
      // Draw the current stroke on top
      if (isDrawing && pointsRef.current.length > 0) {
        renderSmoothedStroke(ctx, pointsRef.current);
      }

      // Draw ghost of original selection position when moving
      if (isMovingSelection && originalSelectionPos) {
        ctx.save();
        ctx.strokeStyle = '#555';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([4 / scale, 4 / scale]);
        ctx.strokeRect(
          originalSelectionPos.x,
          originalSelectionPos.y,
          originalSelectionPos.width,
          originalSelectionPos.height,
        );
        ctx.restore();
      }

      // Draw live selection image while moving
      if (isMovingSelection && selectionImageData && selectionRect) {
        ctx.drawImage(
          selectionImageData,
          selectionRect.x,
          selectionRect.y,
          selectionRect.width,
          selectionRect.height,
        );
      }

      // Draw selection marquee (marching ants)
      if ((isSelecting || (selectionRect && !isMovingSelection)) && selectionRect) {
        ctx.save();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1 / scale;
        ctx.setLineDash([4 / scale, 4 / scale]);
        ctx.strokeRect(
          selectionRect.x,
          selectionRect.y,
          selectionRect.width,
          selectionRect.height,
        );
        ctx.strokeStyle = '#FFF';
        ctx.lineDashOffset = 4 / scale;
        ctx.strokeRect(
          selectionRect.x,
          selectionRect.y,
          selectionRect.width,
          selectionRect.height,
        );
        ctx.restore();
      }
      ctx.restore();
    };
    drawOperations();

    };

    if (dataUrl) {
      img.src = dataUrl;
    } else {
      // If no dataUrl (e.g., history is cleared), just clear the canvas
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();
    }
  };

  // Redraw whenever view or history changes
  useEffect(() => {
    redrawCanvas();
  }, [scale, offset, history, historyIndex]);

  const undo = () => {
    if (historyIndex > 0) {
      setHistoryIndex(historyIndex - 1);
    }
  };

  const redo = () => {
    if (historyIndex < history.length - 1) {
      setHistoryIndex(historyIndex + 1);
    }
  };

  const saveToHistory = (newDataUrl: string) => {
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(newDataUrl);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);
  };

  // Initialize canvas on mount
  useEffect(() => {
    initializeCanvas();
  }, []);

  // Initialize canvas with white background
  const initializeCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvas.width;
    offscreenCanvas.height = canvas.height;
    const ctx = offscreenCanvas.getContext('2d');
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    const dataUrl = offscreenCanvas.toDataURL();
    setHistory([dataUrl]);
    setHistoryIndex(0);
    resetZoom();
  };

  // Get mouse/touch coordinates in world space (relative to canvas content)
  const getCoordinates = (e) => {
    const canvas = canvasRef.current;
    if (!canvas) return {x: 0, y: 0};
    const rect = canvas.getBoundingClientRect();

    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;

    const clientX = e.nativeEvent.touches
      ? e.nativeEvent.touches[0].clientX
      : e.nativeEvent.clientX;
    const clientY = e.nativeEvent.touches
      ? e.nativeEvent.touches[0].clientY
      : e.nativeEvent.clientY;

    const screenX = (clientX - rect.left) * scaleX;
    const screenY = (clientY - rect.top) * scaleY;

    // Convert screen coordinates to world coordinates
    const worldX = (screenX - offset.x) / scale;
    const worldY = (screenY - offset.y) / scale;

    return {x: worldX, y: worldY};
  };

  const renderSmoothedStroke = (ctx, points) => {
    ctx.save();
    ctx.lineWidth = brushSize; // Brush size is now constant in world space
    ctx.lineCap = 'round';

    // Set style based on tool and brush type
    if (activeTool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out'; // This erases
      ctx.strokeStyle = 'rgba(0,0,0,1)';
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = penColor;
      if (brushType === 'watercolor') {
        ctx.globalAlpha = 0.2; // Translucency for watercolor
      } else {
        ctx.globalAlpha = 1.0; // Solid brush is opaque
      }
    }

    if (points.length < 3) {
      ctx.beginPath();
      if (points.length > 0) ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      ctx.stroke();
      ctx.restore();
      return;
    }

    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);

    for (let i = 1; i < points.length - 2; i++) {
      const c = (points[i].x + points[i + 1].x) / 2;
      const d = (points[i].y + points[i + 1].y) / 2;
      ctx.quadraticCurveTo(points[i].x, points[i].y, c, d);
    }

    ctx.quadraticCurveTo(
      points[points.length - 2].x,
      points[points.length - 2].y,
      points[points.length - 1].x,
      points[points.length - 1].y,
    );
    ctx.stroke();
    ctx.restore();
  };

  const finalizeText = () => {
    if (!textInput.value.trim() || !canvasRef.current) {
      setIsEditingText(false);
      return;
    }

    const offscreenCanvas = document.createElement('canvas');
    offscreenCanvas.width = canvasRef.current.width;
    offscreenCanvas.height = canvasRef.current.height;
    const offscreenCtx = offscreenCanvas.getContext('2d');
    const lastDataUrl = history[historyIndex];

    const img = new window.Image();
    img.onload = () => {
      offscreenCtx.drawImage(img, 0, 0);
      offscreenCtx.fillStyle = penColor;
      offscreenCtx.font = `${fontSize}px ${fontFamily}`;
      offscreenCtx.textBaseline = 'top';

      const lines = textInput.value.split('\n');
      lines.forEach((line, index) => {
        offscreenCtx.fillText(
          line,
          textInput.x,
          textInput.y + index * fontSize * 1.2,
        );
      });

      saveToHistory(offscreenCanvas.toDataURL());
      setIsEditingText(false);
      setTextInput({value: '', x: 0, y: 0});
    };
    img.src = lastDataUrl;
  };

  const isPointInSelection = (point, rect) => {
    if (!rect) return false;
    return (
      point.x > rect.x &&
      point.x < rect.x + rect.width &&
      point.y > rect.y &&
      point.y < rect.y + rect.height
    );
  };

  const startDrawing = (e) => {
    if (e.type === 'touchstart') e.preventDefault();
    if (isSpacePressed) {
      setIsPanning(true);
      lastPanPointRef.current = {
        x: e.nativeEvent.clientX,
        y: e.nativeEvent.clientY,
      };
      return;
    }
    if (isEditingText) {
      finalizeText();
      if (activeTool === 'text') {
        const coords = getCoordinates(e);
        setIsEditingText(true);
        setTextInput({value: '', x: coords.x, y: coords.y});
        return;
      }
    }

    const {x, y} = getCoordinates(e);
    startPointRef.current = {x, y};

    switch (activeTool) {
      case 'pen':
      case 'eraser':
        setIsDrawing(true);
        pointsRef.current = [{x, y}];
        break;
      case 'text':
        setIsEditingText(true);
        setTextInput({value: '', x: x, y: y});
        break;
      case 'selector':
        if (selectionRect && isPointInSelection({x,y}, selectionRect)) {
          setIsMovingSelection(true);
        } else {
          setSelectionRect(null);
          setSelectionImageData(null);
          setIsSelecting(true);
        }
        break;
      case 'bucket':
        floodFill(x, y);
        break;
    }
  };

  const draw = (e) => {
    if (e.type === 'touchmove') e.preventDefault();
    if (isPanning) {
      const currentPoint = {x: e.nativeEvent.clientX, y: e.nativeEvent.clientY};
      const dx = currentPoint.x - lastPanPointRef.current.x;
      const dy = currentPoint.y - lastPanPointRef.current.y;
      setOffset((prev) => ({x: prev.x + dx, y: prev.y + dy}));
      lastPanPointRef.current = currentPoint;
      return;
    }

    const {x, y} = getCoordinates(e);

    if (isDrawing && (activeTool === 'pen' || activeTool === 'eraser')) {
      const smoothingRatio = smoothness / 10;
      const lastPoint = pointsRef.current[pointsRef.current.length - 1];
      const smoothedX =
        lastPoint.x * smoothingRatio + x * (1 - smoothingRatio);
      const smoothedY =
        lastPoint.y * smoothingRatio + y * (1 - smoothingRatio);
      pointsRef.current.push({x: smoothedX, y: smoothedY});
      redrawCanvas();
    } else if (isSelecting) {
      const newRect = {
        x: Math.min(startPointRef.current.x, x),
        y: Math.min(startPointRef.current.y, y),
        width: Math.abs(startPointRef.current.x - x),
        height: Math.abs(startPointRef.current.y - y),
      };
      setSelectionRect(newRect);
      redrawCanvas();
    } else if (isMovingSelection && selectionRect) {
      const dx = x - startPointRef.current.x;
      const dy = y - startPointRef.current.y;
      setSelectionRect({
        ...selectionRect,
        x: originalSelectionPos.x + dx,
        y: originalSelectionPos.y + dy,
      });
      redrawCanvas();
    }
  };

  const stopDrawing = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDrawing && (activeTool === 'pen' || activeTool === 'eraser')) {
      if (pointsRef.current.length > 0) {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvasRef.current.width;
        offscreenCanvas.height = canvasRef.current.height;
        const offscreenCtx = offscreenCanvas.getContext('2d');
        const lastDataUrl = history[historyIndex];

        const img = new window.Image();
        img.onload = () => {
          offscreenCtx.drawImage(img, 0, 0);
          renderSmoothedStroke(offscreenCtx, pointsRef.current);
          saveToHistory(offscreenCanvas.toDataURL());
          pointsRef.current = [];
        };
        img.src = lastDataUrl;
      }
      setIsDrawing(false);
    } else if (isSelecting) {
      setIsSelecting(false);
      if (selectionRect && (selectionRect.width > 1 || selectionRect.height > 1)) {
        const offscreenCanvas = document.createElement('canvas');
        const ctx = offscreenCanvas.getContext('2d');
        offscreenCanvas.width = selectionRect.width;
        offscreenCanvas.height = selectionRect.height;
        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, selectionRect.x, selectionRect.y, selectionRect.width, selectionRect.height, 0, 0, selectionRect.width, selectionRect.height);
          setSelectionImageData(offscreenCanvas);
          setOriginalSelectionPos(selectionRect);
        };
        img.src = history[historyIndex];
      } else {
        setSelectionRect(null); // Deselect if too small
      }
    } else if (isMovingSelection) {
      setIsMovingSelection(false);
      if (selectionRect && selectionImageData) {
        const offscreenCanvas = document.createElement('canvas');
        offscreenCanvas.width = canvasRef.current.width;
        offscreenCanvas.height = canvasRef.current.height;
        const ctx = offscreenCanvas.getContext('2d');
        const img = new window.Image();
        img.onload = () => {
          ctx.drawImage(img, 0, 0);
          // Clear original area
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(originalSelectionPos.x, originalSelectionPos.y, originalSelectionPos.width, originalSelectionPos.height);
          // Draw image in new position
          ctx.drawImage(selectionImageData, selectionRect.x, selectionRect.y);
          saveToHistory(offscreenCanvas.toDataURL());
          setSelectionImageData(null);
          setSelectionRect(null);
          setOriginalSelectionPos(null);
        };
        img.src = history[historyIndex];
      }
    }
  };

  const floodFill = (startX: number, startY: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const {width, height} = canvas;
  
    // Convert hex to RGBA
    const r = parseInt(penColor.slice(1, 3), 16);
    const g = parseInt(penColor.slice(3, 5), 16);
    const b = parseInt(penColor.slice(5, 7), 16);
    const fillColor = [r, g, b, 255];
  
    const imageData = ctx.getImageData(0, 0, width, height);
    const data = imageData.data;
  
    const getPixel = (x, y) => {
      if (x < 0 || x >= width || y < 0 || y >= height) {
        return [-1, -1, -1, -1]; // invalid color
      }
      const offset = (y * width + x) * 4;
      return data.slice(offset, offset + 4);
    };
  
    const setPixel = (x, y) => {
      const offset = (y * width + x) * 4;
      data[offset] = fillColor[0];
      data[offset + 1] = fillColor[1];
      data[offset + 2] = fillColor[2];
      data[offset + 3] = fillColor[3];
    };
  
    const colorsMatch = (a, b) => {
      return a[0] === b[0] && a[1] === b[1] && a[2] === b[2] && a[3] === b[3];
    };
  
    const startXInt = Math.floor(startX);
    const startYInt = Math.floor(startY);
  
    const targetColor = Array.from(getPixel(startXInt, startYInt));
  
    if (colorsMatch(targetColor, fillColor)) {
      return; // Clicked on area that's already the fill color
    }
  
    const queue = [[startXInt, startYInt]];
    const visited = new Set();
  
    while (queue.length > 0) {
      const [x, y] = queue.shift();
      const key = `${x},${y}`;
  
      if (x < 0 || x >= width || y < 0 || y >= height || visited.has(key)) {
        continue;
      }
  
      const currentColor = Array.from(getPixel(x, y));
      if (colorsMatch(currentColor, targetColor)) {
        setPixel(x, y);
        visited.add(key);
        queue.push([x + 1, y]);
        queue.push([x - 1, y]);
        queue.push([x, y + 1]);
        queue.push([x, y - 1]);
      }
    }
  
    ctx.putImageData(imageData, 0, 0);
    saveToHistory(canvas.toDataURL());
  };

  const clearCanvas = () => {
    initializeCanvas();
    setSelectionRect(null);
    setSelectionImageData(null);
  };

  useEffect(() => {
    if (isEditingText && textAreaRef.current) {
      textAreaRef.current.focus();
    }
  }, [isEditingText]);

  useEffect(() => {
    if (activeTool !== 'text' && isEditingText) {
      finalizeText();
    }
    if (activeTool !== 'selector') {
      setIsSelecting(false);
      setIsMovingSelection(false);
      setSelectionRect(null);
      setSelectionImageData(null);
      redrawCanvas();
    }
  }, [activeTool]);

  // Spacebar pan listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        e.code === 'Space' &&
        target.tagName !== 'INPUT' &&
        target.tagName !== 'TEXTAREA'
      ) {
        e.preventDefault();
        setIsSpacePressed(true);
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (e.code === 'Space') {
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
        setIsSpacePressed(false);
        setIsPanning(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, []);

  // Mouse wheel zoom
  const handleWheel = (e: React.WheelEvent<HTMLCanvasElement>) => {
    e.preventDefault();
    if (!canvasRef.current) return;
    const rect = canvasRef.current.getBoundingClientRect();
    const scaleAmount = -e.deltaY * 0.001;
    const newScale = Math.min(Math.max(0.1, scale * (1 + scaleAmount)), 10);
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;
    const worldX = (mouseX - offset.x) / scale;
    const worldY = (mouseY - offset.y) / scale;
    const newOffsetX = mouseX - worldX * newScale;
    const newOffsetY = mouseY - worldY * newScale;
    setScale(newScale);
    setOffset({x: newOffsetX, y: newOffsetY});
  };

  const zoomWithCenter = (newScale: number) => {
    if (!canvasRef.current) return;
    const canvas = canvasRef.current;
    const centerX = canvas.clientWidth / 2;
    const centerY = canvas.clientHeight / 2;
    const worldX = (centerX - offset.x) / scale;
    const worldY = (centerY - offset.y) / scale;
    const newOffsetX = centerX - worldX * newScale;
    const newOffsetY = centerY - worldY * newScale;
    setScale(newScale);
    setOffset({x: newOffsetX, y: newOffsetY});
  };

  const zoomIn = () => zoomWithCenter(Math.min(scale * 1.2, 10));
  const zoomOut = () => zoomWithCenter(Math.max(scale / 1.2, 0.1));
  const resetZoom = () => {
    setScale(1);
    setOffset({x: 0, y: 0});
  };

  const handleColorChange = (e) => {
    setPenColor(e.target.value);
    if (activeTool === 'eraser' || activeTool === 'selector' || activeTool === 'text') {
        setActiveTool('pen');
    }
  };

  const openColorPicker = () => {
    if (colorInputRef.current) {
      if (activeTool === 'eraser' || activeTool === 'selector' || activeTool === 'text') {
        setActiveTool('pen');
      }
      colorInputRef.current.click();
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      openColorPicker();
    }
  };

  const triggerImport = () => {
    importInputRef.current?.click();
  };

  const handleImageImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && canvasRef.current) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const img = new window.Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = canvas.width;
          offscreenCanvas.height = canvas.height;
          const ctx = offscreenCanvas.getContext('2d');
          ctx.fillStyle = '#FFFFFF';
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const dataUrl = offscreenCanvas.toDataURL();
          setHistory([dataUrl]);
          setHistoryIndex(0);
          resetZoom();
        };
        img.src = event.target.result as string;
      };
      reader.readAsDataURL(file);
      e.target.value = '';
    }
  };

  const exportCanvas = () => {
    if (!canvasRef.current || historyIndex < 0) return;
    const link = document.createElement('a');
    link.download = 'drawing.png';
    link.href = history[historyIndex];
    link.click();
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (historyIndex < 0) return;

    setIsLoading(true);

    try {
      const canvasDataUrl = history[historyIndex];
      const drawingData = canvasDataUrl.split(',')[1];
      const requestPayload = {
        prompt,
        drawingData,
        customApiKey,
      };

      console.log('Request payload:', {
        ...requestPayload,
        drawingData: drawingData
          ? `${drawingData.substring(0, 50)}... (truncated)`
          : null,
        customApiKey: customApiKey ? '**********' : null,
      });

      const contents: Content[] = [
        {
          role: 'USER',
          parts: [{inlineData: {data: drawingData, mimeType: 'image/png'}}],
        },
        {
          role: 'USER',
          parts: [
            {
              text: `${prompt}. Keep the same minimal line drawing style.`,
            },
          ],
        },
      ];

      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          responseModalities: [Modality.TEXT, Modality.IMAGE],
        },
      });

      const data = {
        success: true,
        message: '',
        imageData: null,
        error: undefined,
      };

      for (const part of response.candidates[0].content.parts) {
        if (part.text) {
          data.message = part.text;
        } else if (part.inlineData) {
          data.imageData = part.inlineData.data;
        }
      }

      console.log('Response:', {
        ...data,
        imageData: data.imageData
          ? `${data.imageData.substring(0, 50)}... (truncated)`
          : null,
      });

      if (data.success && data.imageData) {
        const imageUrl = `data:image/png;base64,${data.imageData}`;
        const img = new window.Image();
        img.onload = () => {
          const canvas = canvasRef.current;
          const offscreenCanvas = document.createElement('canvas');
          offscreenCanvas.width = canvas.width;
          offscreenCanvas.height = canvas.height;
          const ctx = offscreenCanvas.getContext('2d');
          ctx.drawImage(img, 0, 0);
          saveToHistory(offscreenCanvas.toDataURL());
          resetZoom();
        };
        img.src = imageUrl;
      } else {
        console.error('Failed to generate image:', data.error);
        alert('Failed to generate image. Please try again.');
      }
    } catch (error) {
      console.error('Error submitting drawing:', error);
      setErrorMessage(error.message || 'An unexpected error occurred.');
      setShowErrorModal(true);
    } finally {
      setIsLoading(false);
    }
  };

  const closeErrorModal = () => {
    setShowErrorModal(false);
  };

  const getCanvasCursor = () => {
    if (isPanning) return 'cursor-grabbing';
    if (isSpacePressed) return 'cursor-grab';
    switch (activeTool) {
      case 'text':
        return 'cursor-text';
      case 'selector':
        return 'cursor-default';
      case 'bucket':
        return 'cursor-copy'; // A fill cursor might not exist, copy is close
      default:
        return 'hover:cursor-crosshair';
    }
  }

  return (
    <>
      <input
        type="file"
        ref={importInputRef}
        onChange={handleImageImport}
        accept="image/*"
        className="hidden"
        aria-label="Import image file"
      />
      <div className="min-h-screen notebook-paper-bg text-gray-900 flex flex-col justify-start items-center">
        <main className="container mx-auto px-3 sm:px-6 py-5 sm:py-10 pb-32 max-w-7xl w-full">
          {/* Header section with title and tools */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end mb-2 sm:mb-6 gap-2">
            <div className="hidden 2xl:block">
              <h1 className="text-2xl sm:text-3xl font-bold mb-0 leading-tight font-mega">
                Gemini Co-Drawing
              </h1>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                Built with{' '}
                <a
                  className="underline"
                  href="https://ai.google.dev/gemini-api/docs/image-generation"
                  target="_blank"
                  rel="noopener noreferrer">
                  Gemini native image generation
                </a>
              </p>
              <p className="text-sm sm:text-base text-gray-500 mt-1">
                by{' '}
                <a
                  className="underline"
                  href="https://x.com/trudypainter"
                  target="_blank"
                  rel="noopener noreferrer">
                  @trudypainter
                </a>{' '}
                and{' '}
                <a
                  className="underline"
                  href="https://x.com/alexanderchen"
                  target="_blank"
                  rel="noopener noreferrer">
                  @alexanderchen
                </a>
              </p>
            </div>

            <menu className="flex flex-1 items-center bg-gray-300 rounded-full p-2 shadow-sm self-start sm:self-auto gap-2 flex-wrap justify-center sm:justify-start">
              <div className="relative">
                <select
                  value={selectedModel}
                  onChange={(e) => setSelectedModel(e.target.value)}
                  className="h-10 rounded-full bg-white pl-3 pr-8 text-sm text-gray-700 shadow-sm transition-all hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-400 appearance-none border-2 border-white"
                  aria-label="Select Gemini Model">
                  <option value="gemini-2.5-flash-image-preview">
                    2.5 Flash
                  </option>
                  <option value="gemini-2.0-flash-preview-image-generation">
                    2.0 Flash
                  </option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <ChevronDown className="w-5 h-5" />
                </div>
              </div>
              <button
                type="button"
                onClick={undo}
                disabled={historyIndex <= 0}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Undo">
                <Undo2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={redo}
                disabled={historyIndex >= history.length - 1}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                aria-label="Redo">
                <Redo2 className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={zoomIn}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110"
                aria-label="Zoom In">
                <ZoomIn className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={zoomOut}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110"
                aria-label="Zoom Out">
                <ZoomOut className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={resetZoom}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110"
                aria-label="Reset Zoom">
                <Maximize className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                className="w-10 h-10 rounded-full overflow-hidden flex items-center justify-center border-2 border-white shadow-sm transition-transform hover:scale-110"
                onClick={openColorPicker}
                onKeyDown={handleKeyDown}
                aria-label="Open color picker"
                style={{backgroundColor: penColor}}>
                <input
                  ref={colorInputRef}
                  type="color"
                  value={penColor}
                  onChange={handleColorChange}
                  className="opacity-0 absolute w-px h-px"
                  aria-label="Select pen color"
                />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTool('pen');
                  setBrushType('solid');
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-gray-50 hover:scale-110 ${
                  activeTool === 'pen' && brushType === 'solid'
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-white'
                }`}
                aria-label="Solid Brush">
                <Paintbrush className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTool('pen');
                  setBrushType('watercolor');
                }}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-gray-50 hover:scale-110 ${
                  activeTool === 'pen' && brushType === 'watercolor'
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-white'
                }`}
                aria-label="Watercolor Brush">
                <Droplet className="w-5 h-5 text-gray-700" />
              </button>
              <div className="flex items-center gap-2 bg-white rounded-full h-10 px-3 shadow-sm">
                <div
                  className="rounded-full"
                  style={{
                    backgroundColor:
                      activeTool === 'eraser' ? '#9ca3af' : penColor,
                    opacity:
                      activeTool === 'pen' && brushType === 'watercolor'
                        ? 0.5
                        : 1,
                    border:
                      activeTool === 'pen' &&
                      penColor.toLowerCase() === '#ffffff'
                        ? '1px solid #ddd'
                        : 'none',
                    width: `${Math.min(brushSize, 24)}px`,
                    height: `${Math.min(brushSize, 24)}px`,
                    minWidth: '2px',
                    minHeight: '2px',
                    transition: 'width 0.1s ease, height 0.1s ease',
                  }}
                  aria-hidden="true"
                />
                <input
                  type="range"
                  min="1"
                  max="50"
                  value={brushSize}
                  onChange={(e) => setBrushSize(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Brush size"
                />
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full h-10 px-3 shadow-sm">
                <Spline className="w-5 h-5 text-gray-500" />
                <input
                  type="range"
                  min="0"
                  max="9"
                  value={smoothness}
                  onChange={(e) => setSmoothness(Number(e.target.value))}
                  className="w-20 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Line smoothness"
                />
              </div>
              <button
                type="button"
                onClick={() => setActiveTool('text')}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-gray-50 hover:scale-110 ${
                  activeTool === 'text'
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-white'
                }`}
                aria-label="Text Tool">
                <Type className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('selector')}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-gray-50 hover:scale-110 ${
                  activeTool === 'selector'
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-white'
                }`}
                aria-label="Selector Tool">
                <BoxSelect className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() => setActiveTool('bucket')}
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-gray-50 hover:scale-110 ${
                  activeTool === 'bucket'
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-white'
                }`}
                aria-label="Paint Bucket Tool">
                <PaintBucket className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={() =>
                  setActiveTool(activeTool === 'eraser' ? 'pen' : 'eraser')
                }
                className={`w-10 h-10 rounded-full flex items-center justify-center shadow-sm transition-all hover:bg-gray-50 hover:scale-110 ${
                  activeTool === 'eraser'
                    ? 'bg-blue-200 ring-2 ring-blue-400'
                    : 'bg-white'
                }`}
                aria-label="Toggle Eraser">
                <Eraser className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={triggerImport}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110"
                aria-label="Import Image">
                <Import className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={exportCanvas}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110"
                aria-label="Export Image">
                <ShareIcon className="w-5 h-5 text-gray-700" />
              </button>
              <button
                type="button"
                onClick={clearCanvas}
                className="w-10 h-10 rounded-full flex items-center justify-center bg-white shadow-sm transition-all hover:bg-gray-50 hover:scale-110">
                <Trash2
                  className="w-5 h-5 text-red-500"
                  aria-label="Clear Canvas"
                />
              </button>
            </menu>
          </div>

          {activeTool === 'text' && (
            <div className="flex items-center bg-gray-100 rounded-full p-2 shadow-sm gap-4 mb-4 justify-center flex-wrap">
              <div className="flex items-center gap-2 bg-white rounded-full h-10 px-3 shadow-sm">
                <label htmlFor="font-family" className="text-sm text-gray-600">
                  Font:
                </label>
                <select
                  id="font-family"
                  value={fontFamily}
                  onChange={(e) => setFontFamily(e.target.value)}
                  className="h-8 bg-transparent text-sm text-gray-700 focus:outline-none border-none"
                  aria-label="Font Family">
                  <option value="Arial">Arial</option>
                  <option value="Verdana">Verdana</option>
                  <option value="Courier New">Courier New</option>
                  <option value="Georgia">Georgia</option>
                  <option value="Comic Sans MS">Comic Sans MS</option>
                </select>
              </div>
              <div className="flex items-center gap-2 bg-white rounded-full h-10 px-3 shadow-sm">
                <label htmlFor="font-size" className="text-sm text-gray-600">
                  Size:
                </label>
                <input
                  id="font-size"
                  type="range"
                  min="8"
                  max="128"
                  value={fontSize}
                  onChange={(e) => setFontSize(Number(e.target.value))}
                  className="w-32 h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                  aria-label="Font size"
                />
                <span className="text-sm text-gray-700 w-8 text-right">
                  {fontSize}px
                </span>
              </div>
            </div>
          )}

          {/* Canvas section with physical canvas styling */}
          <div className="relative w-full mb-6 p-2 sm:p-3 bg-gray shadow-xl rounded-lg  sm:h-[60vh] h-[30vh] min-h-[320px]">
            <canvas
              ref={canvasRef}
              width={960*2}
              height={540*2}
              onMouseDown={startDrawing}
              onMouseMove={draw}
              onMouseUp={stopDrawing}
              onMouseLeave={stopDrawing}
              onTouchStart={startDrawing}
              onTouchMove={draw}
              onTouchEnd={stopDrawing}
              onWheel={handleWheel}
              className={`w-full h-full bg-white border border-gray-300 touch-none rounded-sm ${getCanvasCursor()}`}
            />
            {isEditingText && (
              <textarea
                ref={textAreaRef}
                value={textInput.value}
                onChange={(e) =>
                  setTextInput((prev) => ({...prev, value: e.target.value}))
                }
                onBlur={finalizeText}
                style={{
                  position: 'absolute',
                  left: `${offset.x + textInput.x * scale}px`,
                  top: `${offset.y + textInput.y * scale}px`,
                  fontFamily,
                  fontSize: `${fontSize * scale}px`,
                  lineHeight: 1.2,
                  color: penColor,
                  background: 'rgba(255, 255, 255, 0.7)',
                  border: '1px dashed #999',
                  outline: 'none',
                  overflow: 'hidden',
                  resize: 'none',
                  whiteSpace: 'pre',
                  minWidth: `${fontSize * scale}px`,
                  minHeight: `${fontSize * 1.2 * scale}px`,
                  width: 'auto',
                  height: 'auto',
                }}
                className="p-0 m-0"
              />
            )}
          </div>

          {/* Input form that matches canvas width */}
          <form onSubmit={handleSubmit} className="w-full">
            <div className="relative">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Add your change..."
                className="w-full p-3 sm:p-4 pr-12 sm:pr-14 text-sm sm:text-base border-2 border-black bg-white text-gray-800 shadow-sm focus:ring-2 focus:ring-gray-200 focus:outline-none transition-all font-mono"
                required
              />
              <button
                type="submit"
                disabled={isLoading}
                className="absolute right-3 sm:right-4 top-1/2 -translate-y-1/2 p-1.5 sm:p-2 rounded-none bg-black text-white hover:cursor-pointer hover:bg-gray-800 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors">
                {isLoading ? (
                  <LoaderCircle
                    className="w-5 sm:w-6 h-5 sm:h-6 animate-spin"
                    aria-label="Loading"
                  />
                ) : (
                  <SendHorizontal
                    className="w-5 sm:w-6 h-5 sm:h-6"
                    aria-label="Submit"
                  />
                )}
              </button>
            </div>
          </form>
        </main>
        {/* Error Modal */}
        {showErrorModal && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
              <div className="flex justify-between items-start mb-4">
                <h3 className="text-xl font-bold text-gray-700">
                  Failed to generate
                </h3>
                <button
                  onClick={closeErrorModal}
                  className="text-gray-400 hover:text-gray-500">
                  <X className="w-5 h-5" />
                </button>
              </div>
              <p className="font-medium text-gray-600">
                {parseError(errorMessage)}
              </p>
            </div>
          </div>
        )}
      </div>
    </>
  );
}