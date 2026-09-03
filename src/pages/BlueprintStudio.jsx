import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMine } from '../context/MineContext';
import {
  UploadCloud,
  FileText,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  Trash2,
  Cpu,
  Layers,
  MapPin,
  ArrowRight,
  Shield,
  HardHat,
  Radio,
  Plus,
  Edit3,
  Check,
  X,
  FolderKanban,
  FileCheck,
  Compass,
  Play,
  RotateCcw,
} from 'lucide-react';
import {
  fetchMineMaps,
  uploadBlueprintBackend,
  analyzeBlueprintBackend,
  activateMapBackend,
  deleteMineMapBackend,
  getDefaultMineMap,
  saveCustomMap,
} from '../services/mineMapStore';

const PIPELINE_STATUS_STEPS = [
  { id: 'uploaded', label: 'Blueprint Uploaded', pct: 15 },
  { id: 'preprocessing', label: 'Preprocessing', pct: 35 },
  { id: 'cv_analysis', label: 'CV Analysis', pct: 55 },
  { id: 'structure_detect', label: 'Mine Structure Detection', pct: 72 },
  { id: 'map_generation', label: '2D Map Generation', pct: 88 },
  { id: 'validation', label: 'Map Validation', pct: 95 },
  { id: 'ready', label: 'Map Ready', pct: 100 },
];

export default function BlueprintStudio({ defaultTab = 'upload' }) {
  const navigate = useNavigate();
  const { activeMap, setCustomActiveMap, activateMap, addToast, isDarkMode } = useMine();

  // Primary Tab: 'upload' | 'files' | 'inspector'
  const [activeTab, setActiveTab] = useState(defaultTab === 'files' ? 'files' : 'upload');

  // Upload State
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [fileMeta, setFileMeta] = useState(null);
  const [customMineName, setCustomMineName] = useState('');
  const [customSeam, setCustomSeam] = useState('Seam 4');
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadedMapId, setUploadedMapId] = useState(null);

  // Analysis State & Status Flow
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentStepIndex, setCurrentStepIndex] = useState(-1);
  const [analysisResult, setAnalysisResult] = useState(null);
  const [analysisError, setAnalysisError] = useState(null);

  // Vector Editor & Inspector State
  const [isEditorMode, setIsEditorMode] = useState(false);
  const [editableMap, setEditableMap] = useState(null);
  const [selectedFeature, setSelectedFeature] = useState(null);

  // Mine Map Files List State
  const [mineMapsList, setMineMapsList] = useState([]);
  const [activeMapIdOnServer, setActiveMapIdOnServer] = useState(null);
  const [isLoadingMaps, setIsLoadingMaps] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');

  const fileInputRef = useRef(null);

  // Load Mine Map Files from backend
  const loadMineMaps = useCallback(async () => {
    setIsLoadingMaps(true);
    try {
      const data = await fetchMineMaps();
      if (data && Array.isArray(data.maps)) {
        setMineMapsList(data.maps);
        setActiveMapIdOnServer(data.activeMapId);
      }
    } catch (err) {
      console.warn('Error loading mine maps list:', err);
    } finally {
      setIsLoadingMaps(false);
    }
  }, []);

  useEffect(() => {
    loadMineMaps();
  }, [loadMineMaps]);

  // Sync tab with prop if changed
  useEffect(() => {
    if (defaultTab) {
      setActiveTab(defaultTab === 'files' ? 'files' : 'upload');
    }
  }, [defaultTab]);

  // Handle Drag & Drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleSelectedFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e) => {
    if (e.target.files && e.target.files[0]) {
      handleSelectedFile(e.target.files[0]);
    }
  };

  const handleSelectedFile = (selectedFile) => {
    const validExtensions = ['png', 'jpg', 'jpeg', 'webp', 'pdf'];
    const ext = selectedFile.name.split('.').pop().toLowerCase();

    if (!validExtensions.includes(ext)) {
      addToast({
        title: 'Unsupported File Format',
        message: 'Please upload a PNG, JPG, JPEG, WEBP, or PDF blueprint file.',
        type: 'warning',
      });
      return;
    }

    if (selectedFile.size > 25 * 1024 * 1024) {
      addToast({
        title: 'File Too Large',
        message: 'Maximum blueprint file size is 25 MB.',
        type: 'warning',
      });
      return;
    }

    setFile(selectedFile);
    setFileMeta({
      name: selectedFile.name,
      size: `${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`,
      type: ext.toUpperCase(),
    });
    setCustomMineName(selectedFile.name.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' '));
    setUploadSuccess(false);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCurrentStepIndex(-1);
    setIsEditorMode(false);
    setUploadedMapId(null);

    // Create object URL preview
    if (ext === 'pdf') {
      setPreviewUrl('/assets/sample_mine_blueprint.jpg'); // PDF thumbnail preview fallback
    } else {
      const url = URL.createObjectURL(selectedFile);
      setPreviewUrl(url);
    }
  };

  const handleRemoveFile = () => {
    setFile(null);
    setPreviewUrl('');
    setFileMeta(null);
    setUploadProgress(0);
    setUploadSuccess(false);
    setAnalysisResult(null);
    setAnalysisError(null);
    setCurrentStepIndex(-1);
    setIsEditorMode(false);
    setUploadedMapId(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Load authentic sample blueprint
  const handleLoadSample = async (sampleName = 'sample_mine_blueprint.jpg') => {
    try {
      setIsUploading(true);
      setUploadProgress(40);

      const response = await fetch(`/assets/${sampleName}`);
      if (!response.ok) throw new Error('Sample blueprint file not reachable.');
      const blob = await response.blob();
      const ext = sampleName.split('.').pop().toLowerCase();
      const sampleFile = new File([blob], sampleName, {
        type: ext === 'pdf' ? 'application/pdf' : ext === 'png' ? 'image/png' : 'image/jpeg',
      });

      setUploadProgress(100);
      setIsUploading(false);
      setFile(sampleFile);
      setFileMeta({
        name: sampleName,
        size: `${(blob.size / 1024).toFixed(0)} KB`,
        type: ext.toUpperCase(),
      });
      setCustomMineName(sampleName.replace(/\.[^/.]+$/, '').replace(/[-_]/g, ' ').toUpperCase());
      setPreviewUrl(`/assets/${sampleName}`);
      setUploadSuccess(true);
      setAnalysisResult(null);
      setAnalysisError(null);
      setCurrentStepIndex(-1);

      addToast({
        title: 'Sample Blueprint Loaded',
        message: `Authentic CAD plan (${sampleName}) ready for backend CV/ML analysis.`,
        type: 'success',
      });
    } catch (err) {
      setIsUploading(false);
      console.warn('Sample load error:', err);
      addToast({
        title: 'Error Loading Sample',
        message: 'Could not fetch sample blueprint asset.',
        type: 'warning',
      });
    }
  };

  // Execute Backend CV/ML Analysis Pipeline with Exact Status Flow
  const handleAnalyzeBlueprint = async () => {
    if (!file && !previewUrl) {
      addToast({
        title: 'No Blueprint Uploaded',
        message: 'Please upload an image or PDF blueprint first.',
        type: 'warning',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      setAnalysisError(null);

      // Step 1: Blueprint Uploaded
      setCurrentStepIndex(0);
      setUploadProgress(20);

      // Upload file to backend
      let targetFile = file;
      if (!targetFile && previewUrl) {
        // Fetch preview blob if user loaded sample without direct file object
        const resBlob = await fetch(previewUrl).then((r) => r.blob());
        targetFile = new File([resBlob], fileMeta?.name || 'blueprint.jpg', { type: 'image/jpeg' });
      }

      const uploadRes = await uploadBlueprintBackend(
        targetFile,
        customMineName || fileMeta?.name?.replace(/\.[^/.]+$/, ''),
        customSeam || 'Seam 4',
        false
      );

      const mapId = uploadRes.mapId;
      setUploadedMapId(mapId);
      setUploadSuccess(true);
      setUploadProgress(100);

      // Step 2: Preprocessing
      setCurrentStepIndex(1);
      await new Promise((r) => setTimeout(r, 400));

      // Step 3: CV Analysis
      setCurrentStepIndex(2);
      await new Promise((r) => setTimeout(r, 450));

      // Step 4: Mine Structure Detection
      setCurrentStepIndex(3);
      await new Promise((r) => setTimeout(r, 400));

      // Step 5: 2D Map Generation (Call Backend Analyze API)
      setCurrentStepIndex(4);
      const analyzeRes = await analyzeBlueprintBackend(mapId, true);

      // Step 6: Map Validation
      setCurrentStepIndex(5);
      await new Promise((r) => setTimeout(r, 350));

      if (!analyzeRes.success) {
        setIsAnalyzing(false);
        setAnalysisError(
          analyzeRes.error || 'Unable to confidently detect mine structure from this blueprint.'
        );
        addToast({
          title: 'Analysis Low Confidence',
          message: 'Unable to confidently detect mine structure from this blueprint.',
          type: 'critical',
        });
        return;
      }

      // Step 7: Map Ready
      setCurrentStepIndex(6);
      const generatedMap = analyzeRes.generatedMap;
      setAnalysisResult(generatedMap);
      setEditableMap(JSON.parse(JSON.stringify(generatedMap)));
      setIsAnalyzing(false);

      // Automatically activate generated map on dashboard
      if (activateMap) {
        await activateMap(mapId);
      } else if (setCustomActiveMap) {
        setCustomActiveMap(generatedMap);
      }

      // Refresh Mine Map Files table
      loadMineMaps();

      addToast({
        title: 'Map Ready & Activated',
        message: `Extracted ${generatedMap.counts.roadways} roadways, ${generatedMap.counts.junctions} junctions, and ${generatedMap.counts.sensors} sensors.`,
        type: 'success',
      });
    } catch (err) {
      setIsAnalyzing(false);
      setAnalysisError(err.message || 'Unable to confidently detect mine structure from this blueprint.');
      addToast({
        title: 'Pipeline Error',
        message: err.message || 'Error processing blueprint.',
        type: 'critical',
      });
    }
  };

  // Confirm and Save map into System
  const handleConfirmAndSaveMap = async () => {
    if (!editableMap) return;

    if (uploadedMapId && activateMap) {
      await activateMap(uploadedMapId);
    } else if (setCustomActiveMap) {
      setCustomActiveMap(editableMap);
    }

    addToast({
      title: '2D Mine Map Active',
      message: 'Map is now live in Command Dashboard & 2D Map sections.',
      type: 'success',
    });

    setTimeout(() => {
      navigate('/overview');
    }, 600);
  };

  // Activate specific map from Mine Map Files
  const handleActivateMapFile = async (targetMapId) => {
    try {
      if (activateMap) {
        await activateMap(targetMapId);
      } else {
        await activateMapBackend(targetMapId);
      }
      setActiveMapIdOnServer(targetMapId);
      await loadMineMaps();
      addToast({
        title: 'Active Map Updated',
        message: `Mine map #${targetMapId} is now active on the dashboard.`,
        type: 'success',
      });
    } catch (err) {
      addToast({
        title: 'Activation Failed',
        message: err.message || 'Could not activate selected map.',
        type: 'warning',
      });
    }
  };

  // Delete map from Mine Map Files
  const handleDeleteMapFile = async (targetMapId) => {
    if (!window.confirm(`Delete mine map record #${targetMapId}?`)) return;
    try {
      await deleteMineMapBackend(targetMapId);
      await loadMineMaps();
      addToast({
        title: 'Map Record Deleted',
        message: `Map #${targetMapId} was removed from storage.`,
        type: 'info',
      });
    } catch (err) {
      addToast({
        title: 'Delete Failed',
        message: err.message,
        type: 'warning',
      });
    }
  };

  // Editor operations
  const handleAddRoadway = () => {
    if (!editableMap) return;
    const nextIdx = editableMap.roadways.length + 1;
    const jCount = editableMap.junctions.length;
    const fromId = editableMap.junctions[jCount - 2]?.id || 'J-01';
    const toId = editableMap.junctions[jCount - 1]?.id || 'J-02';

    const newRoadway = {
      id: `R-USER-${String(nextIdx).padStart(2, '0')}`,
      from: fromId,
      to: toId,
      type: 'roadway_secondary',
      label: `Custom Gallery R-${nextIdx}`,
      length: 120,
      confidence: 1.0,
    };

    setEditableMap((prev) => ({
      ...prev,
      roadways: [...prev.roadways, newRoadway],
      counts: { ...prev.counts, roadways: prev.roadways.length + 1 },
    }));

    addToast({
      title: 'Roadway Added',
      message: `Added custom roadway segment ${newRoadway.id}.`,
      type: 'info',
    });
  };

  const handleAddSensor = () => {
    if (!editableMap) return;
    const nextNum = editableMap.sensors.length + 1;
    const newSensor = {
      id: `S-NEW-${String(nextNum).padStart(2, '0')}`,
      name: `Added Extensometer ${nextNum}`,
      type: 'LVDT',
      nodeId: editableMap.junctions[0]?.id || 'J-01',
      zone: 'B',
      displacement: 0.8,
      status: 'SAFE',
    };

    setEditableMap((prev) => ({
      ...prev,
      sensors: [...prev.sensors, newSensor],
      counts: { ...prev.counts, sensors: prev.sensors.length + 1 },
    }));

    addToast({
      title: 'Sensor Node Placed',
      message: `Deployed new displacement sensor ${newSensor.id} in Zone B.`,
      type: 'success',
    });
  };

  const filteredMaps = mineMapsList.filter(
    (m) =>
      m.mineName?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.mapId?.toLowerCase().includes(searchFilter.toLowerCase()) ||
      m.originalBlueprint?.toLowerCase().includes(searchFilter.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-12 animate-fadeIn select-none">
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-mine-border pb-4">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-2xl font-bold tracking-tight text-mine-text-primary flex items-center gap-2">
              <Cpu className="h-6 w-6 text-status-safe" />
              <span>Administration → Admin: Blueprint 2D Map Studio</span>
            </h1>
            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-status-safe/15 text-status-safe border border-status-safe/30">
              CV + ML BACKEND
            </span>
            {activeMap && !activeMap.isDefault && (
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 border border-cyan-500/30">
                ACTIVE: {activeMap.mineName || activeMap.mapId}
              </span>
            )}
          </div>
          <p className="text-xs text-mine-text-secondary mt-1">
            Upload underground mine blueprints (PNG, JPG, WEBP, PDF). The backend OpenCV + ML pipeline detects tunnel structures, junctions, and rooms to synthesize a digital 2D map.
          </p>
        </div>

        {/* Studio Tabs Header */}
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-mine-surface-alt border border-mine-border text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('upload')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeTab === 'upload'
                ? 'bg-mine-surface text-mine-text-primary shadow-sm border border-mine-border'
                : 'text-mine-text-secondary hover:text-mine-text-primary'
            }`}
          >
            <UploadCloud className="h-3.5 w-3.5 text-status-safe" />
            <span>Upload Blueprint</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('files')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
              activeTab === 'files'
                ? 'bg-mine-surface text-mine-text-primary shadow-sm border border-mine-border'
                : 'text-mine-text-secondary hover:text-mine-text-primary'
            }`}
          >
            <FolderKanban className="h-3.5 w-3.5 text-cyan-500" />
            <span>Mine Map Files ({mineMapsList.length})</span>
          </button>

          {analysisResult && (
            <button
              type="button"
              onClick={() => setActiveTab('inspector')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition ${
                activeTab === 'inspector'
                  ? 'bg-mine-surface text-mine-text-primary shadow-sm border border-mine-border'
                  : 'text-mine-text-secondary hover:text-mine-text-primary'
              }`}
            >
              <Eye className="h-3.5 w-3.5 text-status-attention" />
              <span>2D Vector Preview</span>
            </button>
          )}
        </div>
      </div>

      {/* ── TAB 1: UPLOAD & ANALYZE BLUEPRINT ───────────────────────────────── */}
      {activeTab === 'upload' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* Left Column: Upload Component (5 cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="card p-5 bg-mine-surface border border-mine-border shadow-card space-y-4">
              
              {/* Header */}
              <div className="flex items-center justify-between border-b border-mine-border pb-3">
                <div className="flex items-center gap-2">
                  <span className="p-1.5 rounded-lg bg-mine-surface-alt border border-mine-border text-mine-text-primary">
                    <UploadCloud className="h-4 w-4 text-status-safe" />
                  </span>
                  <div>
                    <h2 className="text-sm font-bold text-mine-text-primary">Upload Mine Blueprint</h2>
                    <p className="text-[11px] text-mine-text-secondary">PNG, JPG, JPEG, WEBP or PDF (Max 25MB)</p>
                  </div>
                </div>

                {/* Sample Blueprints Dropdown / Quick Loaders */}
                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={() => handleLoadSample('sample_mine_blueprint.jpg')}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-status-attention/15 text-status-attention hover:bg-status-attention hover:text-white border border-status-attention/30 transition"
                    title="Load Blueprint A (Raniganj Seam-4 CAD Plan)"
                  >
                    Blueprint A
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('mine_blueprint_b.png')}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/30 transition"
                    title="Load Blueprint B (Central Colliery Seam-7)"
                  >
                    Blueprint B
                  </button>
                  <button
                    type="button"
                    onClick={() => handleLoadSample('mine_blueprint_c.pdf')}
                    className="text-[10px] font-semibold px-2 py-1 rounded bg-purple-500/15 text-purple-600 dark:text-purple-400 hover:bg-purple-500 hover:text-white border border-purple-500/30 transition"
                    title="Load Blueprint C (PDF CAD Document)"
                  >
                    PDF
                  </button>
                </div>
              </div>

              {/* Colliery Details Form Inputs */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary block mb-1">
                    Mine / Project Name
                  </label>
                  <input
                    type="text"
                    value={customMineName}
                    onChange={(e) => setCustomMineName(e.target.value)}
                    placeholder="e.g. Raniganj Seam 4"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-mine-surface-alt border border-mine-border text-mine-text-primary focus:outline-none focus:border-status-safe"
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-mine-text-secondary block mb-1">
                    Mining Seam / Horizon
                  </label>
                  <input
                    type="text"
                    value={customSeam}
                    onChange={(e) => setCustomSeam(e.target.value)}
                    placeholder="e.g. Seam 4"
                    className="w-full text-xs px-2.5 py-1.5 rounded-lg bg-mine-surface-alt border border-mine-border text-mine-text-primary focus:outline-none focus:border-status-safe"
                  />
                </div>
              </div>

              {/* Hidden native input */}
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                accept=".png,.jpg,.jpeg,.webp,.pdf"
                className="hidden"
              />

              {/* Drag & Drop Upload Zone */}
              <div
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-5 text-center cursor-pointer transition-all duration-200 flex flex-col items-center justify-center min-h-[150px] ${
                  previewUrl
                    ? 'border-status-safe/50 bg-status-safe/5'
                    : 'border-mine-border hover:border-status-safe/60 hover:bg-mine-surface-alt/50 bg-mine-bg/50'
                }`}
              >
                <div className="w-10 h-10 rounded-full bg-mine-surface-alt border border-mine-border flex items-center justify-center text-status-safe mb-2 shadow-sm">
                  <UploadCloud className="h-5 w-5" />
                </div>
                <span className="text-xs font-semibold text-mine-text-primary">
                  Drag & Drop your mine blueprint here
                </span>
                <span className="text-[11px] text-mine-text-secondary my-1">or</span>
                <button
                  type="button"
                  className="px-3 py-1 rounded text-xs font-semibold bg-mine-surface text-mine-text-primary border border-mine-border hover:bg-mine-surface-alt shadow-sm transition"
                >
                  Browse Files
                </button>
              </div>

              {/* Selected File Details & Preview */}
              {fileMeta && (
                <div className="card p-3 bg-mine-surface-alt border border-mine-border space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 overflow-hidden">
                      <div className="w-8 h-8 rounded bg-mine-surface border border-mine-border flex items-center justify-center font-bold text-[10px] text-mine-text-primary flex-shrink-0">
                        {fileMeta.type}
                      </div>
                      <div className="overflow-hidden">
                        <p className="text-xs font-bold text-mine-text-primary truncate">{fileMeta.name}</p>
                        <p className="text-[10px] text-mine-text-secondary font-mono">
                          Format: {fileMeta.type} • Size: {fileMeta.size}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="p-1 rounded text-mine-text-secondary hover:text-status-critical hover:bg-mine-surface transition"
                      title="Remove file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>

                  {/* Thumbnail / PDF Preview */}
                  {previewUrl && (
                    <div className="relative rounded-lg overflow-hidden border border-mine-border bg-black/40 max-h-36 flex items-center justify-center">
                      <img
                        src={previewUrl}
                        alt="Blueprint Preview"
                        className="w-full h-36 object-contain object-center"
                      />
                      <div className="absolute top-2 right-2 px-1.5 py-0.5 rounded bg-black/70 text-white font-mono text-[9px] font-bold">
                        {fileMeta.type} PREVIEW
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Action Button: Upload & Analyze */}
              <div>
                <button
                  type="button"
                  onClick={handleAnalyzeBlueprint}
                  disabled={(!file && !previewUrl) || isAnalyzing}
                  className={`w-full py-2.5 px-4 rounded-lg font-bold text-xs flex items-center justify-center gap-2 transition shadow-md ${
                    isAnalyzing
                      ? 'bg-mine-surface-alt text-mine-text-secondary border border-mine-border cursor-wait'
                      : 'bg-status-safe hover:bg-status-safe/90 text-white shadow-emerald-500/20'
                  }`}
                >
                  {isAnalyzing ? (
                    <>
                      <RefreshCw className="h-4 w-4 animate-spin" />
                      <span>Executing Backend CV/ML Pipeline...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="h-4 w-4" />
                      <span>Upload &amp; Analyze Mine Blueprint</span>
                    </>
                  )}
                </button>
              </div>

              {/* Failure / Low Confidence Box */}
              {analysisError && (
                <div className="card p-3.5 bg-red-500/10 border border-red-500/30 text-status-critical text-xs space-y-2">
                  <div className="flex items-center gap-1.5 font-bold">
                    <AlertTriangle className="h-4 w-4 text-red-500" />
                    <span>Unable to confidently detect mine structure from this blueprint.</span>
                  </div>
                  <p className="text-[11px] text-mine-text-secondary">
                    {analysisError} Ensure the uploaded blueprint contains clear high-contrast tunnel boundaries, CAD lines, or pillar galleries.
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={handleAnalyzeBlueprint}
                      className="px-3 py-1 rounded bg-status-critical text-white text-[11px] font-semibold hover:opacity-90 transition"
                    >
                      Retry Analysis
                    </button>
                    <button
                      type="button"
                      onClick={handleRemoveFile}
                      className="px-3 py-1 rounded bg-mine-surface text-mine-text-primary border border-mine-border text-[11px] font-semibold hover:bg-mine-surface-alt transition"
                    >
                      Upload Another Blueprint
                    </button>
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Right Column: Processing Status Flow & Live Generated Preview (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            
            {/* Status Flow Strip (Requested Step-by-Step UI) */}
            <div className="card p-4 bg-mine-surface border border-mine-border shadow-card space-y-3">
              <div className="flex items-center justify-between border-b border-mine-border pb-2.5">
                <span className="text-xs font-bold uppercase tracking-wider text-mine-text-secondary flex items-center gap-1.5">
                  <Cpu className="h-4 w-4 text-status-safe" />
                  <span>CV + ML Pipeline Status Flow</span>
                </span>
                <span className="text-xs font-mono font-bold text-status-safe">
                  {currentStepIndex >= 0 ? `${PIPELINE_STATUS_STEPS[currentStepIndex]?.pct}%` : 'STANDBY'}
                </span>
              </div>

              {/* Status Flow Stepper */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PIPELINE_STATUS_STEPS.map((step, idx) => {
                  const isDone = currentStepIndex > idx || currentStepIndex === PIPELINE_STATUS_STEPS.length - 1;
                  const isCurrent = currentStepIndex === idx && currentStepIndex !== PIPELINE_STATUS_STEPS.length - 1;
                  return (
                    <div
                      key={step.id}
                      className={`p-2 rounded-lg border text-[11px] font-medium transition flex items-center gap-2 ${
                        isDone
                          ? 'bg-status-safe/10 border-status-safe/30 text-status-safe'
                          : isCurrent
                          ? 'bg-amber-500/10 border-amber-500/40 text-amber-600 dark:text-amber-400 animate-pulse'
                          : 'bg-mine-surface-alt/50 border-mine-border/50 text-mine-text-secondary opacity-60'
                      }`}
                    >
                      <span className="text-xs">
                        {isDone ? '✓' : isCurrent ? '●' : '○'}
                      </span>
                      <span className="truncate">{step.label}</span>
                    </div>
                  );
                })}
              </div>

              {/* Progress Bar */}
              {isAnalyzing && currentStepIndex >= 0 && (
                <div className="w-full h-1.5 rounded-full bg-mine-border overflow-hidden">
                  <div
                    className="h-full bg-status-safe transition-all duration-300"
                    style={{ width: `${PIPELINE_STATUS_STEPS[currentStepIndex]?.pct || 15}%` }}
                  />
                </div>
              )}
            </div>

            {/* Generated Map Metrics & Actions */}
            {analysisResult && (
              <div className="card p-4 bg-mine-surface border border-mine-border shadow-card space-y-4 animate-fadeIn">
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-mine-border pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-status-safe animate-pulse" />
                    <h3 className="text-sm font-bold text-mine-text-primary">
                      Generated 2D Mine Map Ready
                    </h3>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-mine-surface-alt border border-mine-border text-mine-text-secondary">
                      {analysisResult.map?.scale?.label || 'CAD 1:500m'}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setActiveTab('inspector')}
                      className="px-3 py-1 rounded text-xs font-semibold bg-mine-surface hover:bg-mine-surface-alt text-mine-text-primary border border-mine-border transition flex items-center gap-1.5"
                    >
                      <Eye className="h-3.5 w-3.5" />
                      <span>Inspect Vector Layout</span>
                    </button>
                    <button
                      type="button"
                      onClick={handleConfirmAndSaveMap}
                      className="px-3.5 py-1 rounded text-xs font-bold bg-status-safe text-white hover:opacity-90 transition shadow-sm flex items-center gap-1.5"
                    >
                      <Check className="h-3.5 w-3.5" />
                      <span>Proceed to Dashboard →</span>
                    </button>
                  </div>
                </div>

                {/* Counts Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 text-center">
                  <div className="card p-2.5 bg-mine-surface-alt border border-mine-border">
                    <span className="text-[10px] text-mine-text-secondary uppercase font-semibold">Roadways</span>
                    <p className="text-lg font-bold font-mono text-mine-text-primary">{analysisResult.counts?.roadways || 0}</p>
                  </div>
                  <div className="card p-2.5 bg-mine-surface-alt border border-mine-border">
                    <span className="text-[10px] text-mine-text-secondary uppercase font-semibold">Junctions</span>
                    <p className="text-lg font-bold font-mono text-mine-text-primary">{analysisResult.counts?.junctions || 0}</p>
                  </div>
                  <div className="card p-2.5 bg-mine-surface-alt border border-mine-border">
                    <span className="text-[10px] text-mine-text-secondary uppercase font-semibold">Shafts</span>
                    <p className="text-lg font-bold font-mono text-mine-text-primary">{analysisResult.counts?.shafts || 0}</p>
                  </div>
                  <div className="card p-2.5 bg-mine-surface-alt border border-mine-border">
                    <span className="text-[10px] text-mine-text-secondary uppercase font-semibold">Miners Placed</span>
                    <p className="text-lg font-bold font-mono text-cyan-500">{analysisResult.counts?.miners || 0}</p>
                  </div>
                </div>

                {/* Mini SVG Preview */}
                <div className="relative rounded-xl overflow-hidden border border-mine-border bg-mine-bg aspect-[16/9] flex items-center justify-center p-2">
                  <svg viewBox="0 0 1000 700" className="w-full h-full select-none pointer-events-none">
                    <rect width="1000" height="700" fill={isDarkMode ? '#17191E' : '#F9F8F5'} />
                    {/* Roadways */}
                    {analysisResult.roadways?.map((r) => {
                      const fromN = analysisResult.junctions?.find((j) => j.id === r.from) || analysisResult.shafts?.find((s) => s.id === r.from);
                      const toN = analysisResult.junctions?.find((j) => j.id === r.to) || analysisResult.shafts?.find((s) => s.id === r.to);
                      if (!fromN || !toN) return null;
                      return (
                        <g key={r.id}>
                          <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y} stroke="#3D3833" strokeWidth="10" strokeLinecap="round" />
                          <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y} stroke="#2D8A4E" strokeWidth="5" strokeLinecap="round" />
                        </g>
                      );
                    })}
                    {/* Junctions */}
                    {analysisResult.junctions?.map((j) => (
                      <circle key={j.id} cx={j.x} cy={j.y} r="5" fill={isDarkMode ? '#242730' : '#FFFFFF'} stroke="#292722" strokeWidth="2" />
                    ))}
                    {/* Shafts */}
                    {analysisResult.shafts?.map((s) => (
                      <rect key={s.id} x={s.x - 14} y={s.y - 8} width="28" height="16" rx="3" fill="#2D8A4E" stroke="#FFFFFF" strokeWidth="1.2" />
                    ))}
                    {/* Miners */}
                    {analysisResult.miners?.map((m) => (
                      <circle key={m.id} cx={m.xCoord} cy={m.yCoord} r="4" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.2" />
                    ))}
                  </svg>
                </div>
              </div>
            )}

            {!analysisResult && !isAnalyzing && (
              <div className="card p-12 bg-mine-surface border border-mine-border text-center flex flex-col items-center justify-center space-y-3 min-h-[320px]">
                <div className="w-12 h-12 rounded-full bg-mine-surface-alt border border-mine-border flex items-center justify-center text-mine-text-secondary">
                  <Layers className="h-6 w-6" />
                </div>
                <h3 className="text-sm font-bold text-mine-text-primary">No 2D Mine Map Generated Yet</h3>
                <p className="text-xs text-mine-text-secondary max-w-sm">
                  Upload an image/PDF blueprint on the left or select a sample, then click &quot;Upload &amp; Analyze Mine Blueprint&quot; to execute the computer vision pipeline.
                </p>
              </div>
            )}

          </div>

        </div>
      )}

      {/* ── TAB 2: MINE MAP FILES SECTION ─────────────────────────────────── */}
      {activeTab === 'files' && (
        <div className="card p-5 bg-mine-surface border border-mine-border shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mine-border pb-3">
            <div>
              <h2 className="text-base font-bold text-mine-text-primary flex items-center gap-2">
                <FolderKanban className="h-5 w-5 text-cyan-500" />
                <span>Mine Map Files Repository</span>
              </h2>
              <p className="text-xs text-mine-text-secondary mt-0.5">
                Catalog of all uploaded blueprint files and their synthesized 2D digital maps. Select any mine map to make it the active dashboard map.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder="Search map ID or colliery name..."
                className="text-xs px-3 py-1.5 rounded-lg bg-mine-surface-alt border border-mine-border text-mine-text-primary focus:outline-none w-56"
              />
              <button
                type="button"
                onClick={loadMineMaps}
                className="p-1.5 rounded-lg bg-mine-surface-alt border border-mine-border text-mine-text-secondary hover:text-mine-text-primary transition"
                title="Refresh mine maps"
              >
                <RefreshCw className={`h-4 w-4 ${isLoadingMaps ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>

          {/* Mine Maps Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-mine-surface-alt text-mine-text-secondary uppercase text-[10px] font-bold border-b border-mine-border">
                <tr>
                  <th className="py-2.5 px-3">Map ID</th>
                  <th className="py-2.5 px-3">Mine Name</th>
                  <th className="py-2.5 px-3">Original Blueprint</th>
                  <th className="py-2.5 px-3">Generated 2D Map</th>
                  <th className="py-2.5 px-3">Upload Date</th>
                  <th className="py-2.5 px-3">Processing Status</th>
                  <th className="py-2.5 px-3">Map Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-mine-border font-medium">
                {filteredMaps.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-mine-text-secondary">
                      No mine maps found matching filter. Upload a new blueprint above.
                    </td>
                  </tr>
                ) : (
                  filteredMaps.map((m) => {
                    const isActive = m.mapStatus === 'Active' || m.mapId === activeMapIdOnServer;
                    return (
                      <tr
                        key={m.mapId}
                        className={`hover:bg-mine-surface-alt/60 transition ${
                          isActive ? 'bg-cyan-500/5 font-semibold' : ''
                        }`}
                      >
                        <td className="py-3 px-3 font-mono font-bold text-mine-text-primary">
                          #{m.mapId}
                        </td>
                        <td className="py-3 px-3 text-mine-text-primary">
                          {m.mineName}
                          <span className="block text-[10px] text-mine-text-secondary font-mono">{m.seam}</span>
                        </td>
                        <td className="py-3 px-3 text-mine-text-secondary">
                          <div className="flex items-center gap-1.5">
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-mine-surface border border-mine-border text-mine-text-primary">
                              {m.fileType || 'JPG'}
                            </span>
                            <span className="truncate max-w-[140px]" title={m.originalBlueprint}>
                              {m.originalBlueprint}
                            </span>
                          </div>
                        </td>
                        <td className="py-3 px-3">
                          {m.counts ? (
                            <span className="text-[11px] font-mono text-mine-text-secondary">
                              {m.counts.roadways} Roads • {m.counts.junctions} Nodes
                            </span>
                          ) : (
                            <span className="text-mine-text-secondary italic">Pending Analysis</span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-mine-text-secondary font-mono text-[11px]">
                          {m.uploadDate ? new Date(m.uploadDate).toLocaleDateString() : '-'}
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              m.processingStatus === 'Map Ready'
                                ? 'bg-status-safe/15 text-status-safe border border-status-safe/30'
                                : m.processingStatus === 'Failed'
                                ? 'bg-status-critical/15 text-status-critical border border-status-critical/30'
                                : 'bg-status-warning/15 text-status-warning border border-status-warning/30'
                            }`}
                          >
                            {m.processingStatus || 'Ready'}
                          </span>
                        </td>
                        <td className="py-3 px-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              isActive
                                ? 'bg-cyan-500 text-white shadow-sm'
                                : 'bg-mine-surface-alt text-mine-text-secondary border border-mine-border'
                            }`}
                          >
                            {isActive ? '✓ ACTIVE' : 'INACTIVE'}
                          </span>
                        </td>
                        <td className="py-3 px-3 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {!isActive && (
                              <button
                                type="button"
                                onClick={() => handleActivateMapFile(m.mapId)}
                                className="px-2.5 py-1 rounded text-[11px] font-bold bg-cyan-500/15 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-500 hover:text-white border border-cyan-500/30 transition"
                                title="Make this map the active dashboard map"
                              >
                                Set as Active
                              </button>
                            )}

                            <button
                              type="button"
                              onClick={() => handleDeleteMapFile(m.mapId)}
                              className="p-1.5 rounded text-mine-text-secondary hover:text-status-critical hover:bg-mine-surface transition"
                              title="Delete map"
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB 3: 2D VECTOR INSPECTOR & EDITOR ─────────────────────────────── */}
      {activeTab === 'inspector' && editableMap && (
        <div className="card p-5 bg-mine-surface border border-mine-border shadow-card space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-mine-border pb-3">
            <div>
              <h2 className="text-base font-bold text-mine-text-primary flex items-center gap-2">
                <Compass className="h-5 w-5 text-status-safe" />
                <span>2D Vector Map CAD Inspector</span>
              </h2>
              <p className="text-xs text-mine-text-secondary">
                Inspect detected underground roadway segments, nodes, and dynamically placed personnel & strata sensors.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setIsEditorMode(!isEditorMode)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold border transition ${
                  isEditorMode
                    ? 'bg-amber-500 text-white border-amber-600'
                    : 'bg-mine-surface text-mine-text-primary border-mine-border hover:bg-mine-surface-alt'
                }`}
              >
                <Edit3 className="h-3.5 w-3.5" />
                <span>{isEditorMode ? 'Exit Editor' : 'Edit Features'}</span>
              </button>

              <button
                type="button"
                onClick={handleConfirmAndSaveMap}
                className="flex items-center gap-1.5 px-3.5 py-1.5 rounded text-xs font-bold bg-status-safe text-white hover:opacity-90 transition shadow-sm"
              >
                <Check className="h-4 w-4" />
                <span>Set as Active Dashboard Map</span>
              </button>
            </div>
          </div>

          {/* Interactive Vector Canvas */}
          <div className="relative rounded-xl overflow-hidden border border-mine-border bg-mine-bg aspect-[10/6] flex items-center justify-center p-2">
            <svg viewBox="0 0 1000 700" className="w-full h-full select-none">
              <rect width="1000" height="700" fill={isDarkMode ? '#17191E' : '#F9F8F5'} />

              {/* Roadways */}
              {editableMap.roadways?.map((r) => {
                const fromN = editableMap.junctions?.find((j) => j.id === r.from) || editableMap.shafts?.find((s) => s.id === r.from);
                const toN = editableMap.junctions?.find((j) => j.id === r.to) || editableMap.shafts?.find((s) => s.id === r.to);
                if (!fromN || !toN) return null;

                return (
                  <g key={r.id}>
                    <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y} stroke="#3D3833" strokeWidth="12" strokeLinecap="round" />
                    <line x1={fromN.x} y1={fromN.y} x2={toN.x} y2={toN.y} stroke="#2D8A4E" strokeWidth="6" strokeLinecap="round" />
                    <g transform={`translate(${(fromN.x + toN.x) / 2}, ${(fromN.y + toN.y) / 2})`}>
                      <rect x="-12" y="-6" width="24" height="12" rx="2" fill="#242730" />
                      <text textAnchor="middle" y="3" fontSize="6" fill="#EDEAE4" fontWeight="600">{r.id}</text>
                    </g>
                  </g>
                );
              })}

              {/* Junctions */}
              {editableMap.junctions?.map((j) => (
                <g key={j.id} transform={`translate(${j.x}, ${j.y})`}>
                  <circle r="6" fill={isDarkMode ? '#242730' : '#FFFFFF'} stroke="#3D3833" strokeWidth="2" />
                  <text y="-9" textAnchor="middle" fontSize="8" fontWeight="bold" fill={isDarkMode ? '#EDEAE4' : '#292722'}>
                    {j.id}
                  </text>
                </g>
              ))}

              {/* Shafts */}
              {editableMap.shafts?.map((s) => (
                <g key={s.id} transform={`translate(${s.x}, ${s.y})`}>
                  <rect x="-20" y="-10" width="40" height="20" rx="3" fill="#2D8A4E" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text y="4" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#FFFFFF">
                    {s.id}
                  </text>
                </g>
              ))}

              {/* Miners */}
              {editableMap.miners?.map((m) => (
                <g key={m.id} transform={`translate(${m.xCoord}, ${m.yCoord - 16})`}>
                  <circle r="6" fill="#06B6D4" stroke="#FFFFFF" strokeWidth="1.5" />
                  <text y="2" textAnchor="middle" fontSize="5" fill="#FFFFFF">⛏</text>
                  <text y="14" textAnchor="middle" fontSize="7" fontWeight="bold" fill="#06B6D4">{m.id}</text>
                </g>
              ))}

              {/* Sensors */}
              {editableMap.sensors?.map((s) => {
                const parentNode = editableMap.junctions?.find((j) => j.id === s.nodeId);
                if (!parentNode) return null;
                return (
                  <g key={s.id} transform={`translate(${parentNode.x + 14}, ${parentNode.y + 12})`}>
                    <circle r="4.5" fill="#C4820E" stroke="#FFFFFF" strokeWidth="1.5" />
                  </g>
                );
              })}
            </svg>
          </div>
        </div>
      )}

    </div>
  );
}
