import React, { useState, useRef, useEffect, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Webcam from 'react-webcam';
import * as faceapi from 'face-api.js';
import { recognizeFrame, storeExcel, getStudentsBySection, submitManualOverride, takeLiveAttendance } from '../services/api';
import ManualOverrideModal from './ManualOverrideModal';

const LiveAttendance = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // Persistence: Recover state from localStorage if not in location (e.g. on refresh)
  const getInitialState = (key, fallback) => {
    const val = location.state?.[key];
    if (val) return val;
    return localStorage.getItem(`last_${key}`) || fallback;
  };

  const className = getInitialState('className', 'Unknown Class');
  const section = getInitialState('section', '');
  const subjectName = getInitialState('subjectName', '');
  const classTime = getInitialState('time', '');

  // Update localStorage when class details change
  useEffect(() => {
    if (location.state?.className) {
      localStorage.setItem('last_className', location.state.className);
    }
    if (location.state?.section) {
      localStorage.setItem('last_section', location.state.section);
    }
    if (location.state?.subjectName) {
      localStorage.setItem('last_subjectName', location.state.subjectName);
    }
    if (location.state?.time) {
      localStorage.setItem('last_time', location.state.time);
    }
  }, [location.state]);

  // State
  const [allStudents, setAllStudents] = useState([]);
  const [attendees, setAttendees] = useState([]); // Array of { ...student, sources: ['live', 'manual', 'img_123'] }
  const [recognizedFaces, setRecognizedFaces] = useState([]); // Now an array of matches
  const [isScanning, setIsScanning] = useState(false);
  const [processing, setProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState('present');

  // Persistence: Load saved attendees on mount
  useEffect(() => {
    if (!className || !section) return;
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `SA_attendance_${className}_${section}_${dateStr}`;

    const saved = localStorage.getItem(key);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Sanitize blob/object URLs as they are invalid after refresh
        const sanitized = parsed.map(a => ({
          ...a,
          img: a.img && (a.img.startsWith('blob:') || a.img.startsWith('http')) ? null : a.img
        }));
        setAttendees(sanitized);
        console.log("Restored attendance session from local storage");
      } catch (e) {
        console.error("Failed to restore session", e);
      }
    }
  }, [className, section]);

  // Persistence: Save attendees on change (debounced for performance)
  useEffect(() => {
    if (!className || !section) return;

    const dateStr = new Date().toISOString().split('T')[0];
    const key = `SA_attendance_${className}_${section}_${dateStr}`;

    // Debounce localStorage writes to avoid excessive saves
    const timeoutId = setTimeout(() => {
      if (attendees.length === 0) {
        // Clear if empty
        localStorage.removeItem(key);
      } else {
        // Save to localStorage
        localStorage.setItem(key, JSON.stringify(attendees));
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(timeoutId);
  }, [attendees, className, section]);

  // Image Upload State
  const [uploadedImages, setUploadedImages] = useState([]); // Array of { id, url, blob, students: [rollNo] }
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  // Save Modal State
  const [showModal, setShowModal] = useState(false);
  const [saveData, setSaveData] = useState({
    filename: '',
    course: '',
    hour: '',
    type: 'Lecture'
  });

  // Manual Override State
  const [showManualOverrideModal, setShowManualOverrideModal] = useState(false);
  const [isSubmittingOverride, setIsSubmittingOverride] = useState(false);

  // Manual Entry State
  const [manualRollInput, setManualRollInput] = useState('');
  const [manualEntryError, setManualEntryError] = useState('');

  // Refs
  const webcamRef = useRef(null);
  const canvasRef = useRef(null);
  const fileInputRef = useRef(null);

  // Load Models
  useEffect(() => {
    const loadModels = async () => {
      const MODEL_URL = process.env.PUBLIC_URL + '/models';
      try {
        await faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL);
        console.log("FaceAPI models loaded");
      } catch (e) {
        console.error("Error loading models:", e);
      }
    };
    loadModels();
  }, []);

  // Fetch Section Students
  useEffect(() => {
    const fetchStudents = async () => {
      if (section) {
        try {
          const response = await getStudentsBySection(section);
          setAllStudents(response.data);
        } catch (err) {
          console.error("Error fetching students:", err);
        }
      }
    };
    fetchStudents();
  }, [section]);

  // UI Loop (Box Drawing)
  useEffect(() => {
    let interval;
    if (isScanning) {
      interval = setInterval(async () => {
        if (webcamRef.current && webcamRef.current.video && webcamRef.current.video.readyState === 4 && canvasRef.current) {
          const video = webcamRef.current.video;
          const displaySize = { width: video.videoWidth, height: video.videoHeight };
          if (!canvasRef.current) return;
          faceapi.matchDimensions(canvasRef.current, displaySize);

          try {
            const detections = await faceapi.detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 512, scoreThreshold: 0.4 }));
            if (!canvasRef.current) return;
            const displaySize = { width: video.videoWidth, height: video.videoHeight };
            const resizedDetections = faceapi.resizeResults(detections, displaySize);
            const ctx = canvasRef.current.getContext('2d');
            if (ctx) {
              ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);

              // We'll use the recognizedFaces state to draw boxes if they exist
              // and fallback to normal detection boxes for others
              resizedDetections.forEach((detection, idx) => {
                const { x, y, width, height } = detection.box;
                let color = '#2563eb'; // Default Blue
                let label = '';

                // Try to find a match for this detection from recognizedFaces
                // This is a simple spatial overlap check
                const match = recognizedFaces.find(f => {
                  const [fx, fy, fw, fh] = f.bbox;
                  // Normalize bbox if needed or just use as is (backend returns frame coords)
                  // For now, let's assume we match by index if they align, 
                  // but spatial match is safer.
                  const overlap = Math.max(0, Math.min(x + width, fx + fw) - Math.max(x, fx)) *
                    Math.max(0, Math.min(y + height, fy + fh) - Math.max(y, fy));
                  return overlap > (width * height * 0.5);
                }) || (recognizedFaces[idx] && recognizedFaces.length === detections.length ? recognizedFaces[idx] : null);

                if (match) {
                  const isUnknown = match.name === "Unknown";


                  if (isUnknown) {
                    color = '#ef4444'; // Red for unknown
                    label = 'Unknown';
                  } else {
                    label = `${match.name}`;
                  }
                }

                ctx.strokeStyle = color;
                ctx.lineWidth = 3;
                ctx.strokeRect(x, y, width, height);

                if (label) {
                  ctx.fillStyle = color;
                  ctx.fillRect(x, y - 24, ctx.measureText(label).width + 12, 24);
                  ctx.fillStyle = '#ffffff';
                  ctx.font = 'bold 14px Inter, sans-serif';
                  ctx.fillText(label, x + 6, y - 7);
                }
              });
            }
          } catch (err) { }
        }
      }, 200); // Optimized: Reduced frequency from 100ms to 200ms to save CPU
    }
    return () => clearInterval(interval);
  }, [isScanning, recognizedFaces]);

  // Upload Logic
  const handleFileUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    // Stop scanning if camera is active
    if (isScanning) setIsScanning(false);

    const newImages = [];

    files.forEach(file => {
      const imageId = `img_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      const imageUrl = URL.createObjectURL(file);

      newImages.push({
        id: imageId,
        url: imageUrl,
        file: file,
        students: [], // Will be populated after scan
        scanned: false
      });
    });

    setUploadedImages(prev => {
      const updated = [...prev, ...newImages];
      setCurrentImageIndex(updated.length - 1); // Switch to newest
      return updated;
    });

    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  // Manual Scan Logic
  const handleScanImage = async () => {
    const currentImage = uploadedImages[currentImageIndex];
    if (!currentImage || currentImage.scanned) return;

    setProcessing(true);
    const formData = new FormData();
    formData.append('image', currentImage.file);

    try {
      const response = await recognizeFrame(formData);
      const matches = response.data.matches || [];
      const imageStudents = matches.map(m => m.roll);

      // Update Attendees with Source Tracking
      setAttendees(prev => {
        const newAttendees = [...prev];
        matches.forEach(match => {
          const existingStudentIndex = newAttendees.findIndex(a => a.roll === match.roll);

          if (existingStudentIndex >= 0) {
            const existingStudent = newAttendees[existingStudentIndex];
            const sources = existingStudent.sources || (existingStudent.isManualOverride ? ['manual'] : ['live']);
            newAttendees[existingStudentIndex] = {
              ...existingStudent,
              sources: sources.includes(currentImage.id) ? sources : [...sources, currentImage.id]
            };
          } else {
            // Add new student
            newAttendees.push({
              sNo: newAttendees.length + 1,
              roll: match.roll,
              name: match.name,
              img: 'uploaded.jpg',
              sources: [currentImage.id]
            });
          }
        });
        return newAttendees.sort((a, b) => a.roll.localeCompare(b.roll));
      });

      // Mark Image as Scanned
      setUploadedImages(prev => {
        const updated = [...prev];
        updated[currentImageIndex] = {
          ...updated[currentImageIndex],
          scanned: true,
          students: imageStudents
        };
        return updated;
      });

      const debug = response.data.debug;
      let msg = `Scanned successfully! Found ${matches.length} students.`;
      if (debug) {
        msg += `\n(Debug: Detected ${debug.faces_detected} faces, Known Encodings: ${debug.known_encodings})`;
        if (debug.faces_detected > 0 && matches.length === 0) {
          msg += `\n\nPossible Reason: Faces detected but didn't match any known students. Check threshold or student registrations.`;
        } else if (debug.faces_detected === 0) {
          msg += `\n\nPossible Reason: No faces detected in image. Try a higher quality image or closer shot.`;
        }
      }
      alert(msg);

    } catch (err) {
      console.error(`Error scanning image:`, err);
      const errorMsg = err.response?.data?.details || err.response?.data?.error || err.message || "An unexpected error occurred.";
      alert(`Error scanning image: ${errorMsg}\n\nPlease check the server console for more details.`);
    } finally {

      setProcessing(false);
    }
  };

  // Delete Single Image
  const handleDeleteImage = (indexToDelete) => {
    const imageToDelete = uploadedImages[indexToDelete];
    if (!imageToDelete) return;

    // Revoke URL to free memory
    URL.revokeObjectURL(imageToDelete.url);

    // Update Attendees: Remove this image source
    setAttendees(prev => {
      return prev.filter(student => {
        // If student has this source
        if (student.sources && student.sources.includes(imageToDelete.id)) {
          const newSources = student.sources.filter(s => s !== imageToDelete.id);

          // If no sources left, remove student
          if (newSources.length === 0) return false;

          // Update sources
          student.sources = newSources;
          return true;
        }
        return true;
      });
    });

    // Remove from uploadedImages
    const newImages = uploadedImages.filter((_, idx) => idx !== indexToDelete);
    setUploadedImages(newImages);

    // Adjust index
    if (newImages.length === 0) {
      setCurrentImageIndex(0);
    } else if (currentImageIndex >= newImages.length) {
      setCurrentImageIndex(newImages.length - 1);
    } else if (indexToDelete < currentImageIndex) {
      setCurrentImageIndex(currentImageIndex - 1);
    }
  };

  // Clear All
  const handleClearAll = useCallback(() => {
    // Revoke all URLs
    uploadedImages.forEach(img => URL.revokeObjectURL(img.url));
    setUploadedImages([]);
    setAttendees([]); // Fully reset
    setCurrentImageIndex(0);
    if (fileInputRef.current) fileInputRef.current.value = '';

    // Clear persistence
    const dateStr = new Date().toISOString().split('T')[0];
    const key = `SA_attendance_${className}_${section}_${dateStr}`;
    localStorage.removeItem(key);
  }, [uploadedImages, className, section]);

  // Recognition Loop (Live Camera)
  useEffect(() => {
    let scanInterval;
    if (isScanning) {
      scanInterval = setInterval(async () => {
        if (!processing && webcamRef.current) {
          setProcessing(true);
          const imageSrc = webcamRef.current.getScreenshot();
          if (imageSrc) {
            const res = await fetch(imageSrc);
            const blob = await res.blob();
            const data = new FormData();
            data.append('image', blob);
            try {
              const response = await recognizeFrame(data);
              const matches = response.data.matches;
              if (matches && matches.length > 0) {
                setRecognizedFaces(matches);

                setAttendees(prev => {
                  let newPrev = [...prev];
                  matches.forEach(match => {
                    if (match.name === "Unknown") return;

                    const existingIndex = newPrev.findIndex(a => a.roll === match.roll);
                    if (existingIndex === -1) {
                      newPrev.push({
                        sNo: newPrev.length + 1,
                        roll: match.roll,
                        name: match.name,
                        img: 'captured.jpg',
                        sources: ['live']
                      });
                    } else {
                      const existing = newPrev[existingIndex];
                      newPrev[existingIndex] = {
                        ...existing,
                        sources: existing.sources && !existing.sources.includes('live')
                          ? [...existing.sources, 'live']
                          : existing.sources || ['live']
                      };
                    }
                  });
                  return newPrev;
                });
                // Keep faces visible for 2 seconds then clear or let next scan update
                // setTimeout(() => setRecognizedFaces([]), 2000); 
              }
            } catch (err) { console.error(err); }
          }
          setProcessing(false);
        }
      }, 1000); // Optimized: Increased from 800ms to 1000ms for better performance
    }
    return () => clearInterval(scanInterval);
  }, [isScanning, processing]);

  // Save Logic
  const handleSaveClick = () => {
    if (attendees.length === 0) {
      alert("No attendees to save!");
      return;
    }

    // Fallbacks if state is missing
    let finalSubject = subjectName;
    let finalSection = section;
    let finalTime = classTime;

    // Robust parsing if state is empty but className is available
    if (!finalSubject && className && className.includes(' (')) {
      finalSubject = className.split(' (')[0];
    }
    if (!finalSection && className && className.includes('(')) {
      const match = className.match(/\((.*?)\)/);
      if (match) finalSection = match[1];
    }
    if (!finalTime) {
      finalTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }

    // Auto-generate filename: classname_section_time
    const cleanSubject = (finalSubject || 'Subject').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const cleanSection = (finalSection || 'Section').replace(/[^a-zA-Z0-9]/g, '_').replace(/_+/g, '_');
    const cleanTime = (finalTime || 'Time').replace(/[:\s]/g, '_').replace(/_+/g, '_');

    const autoFilename = `${cleanSubject}_${cleanSection}_${cleanTime}`;

    setSaveData(prev => ({
      ...prev,
      filename: autoFilename,
      course: finalSubject || '',
      hour: finalTime ? finalTime.split(':')[0] : '1'
    }));

    setShowModal(true);
  };

  const generateCSV = () => {
    let csvContent = "S.No,Roll No,Name,Time\n";
    attendees.forEach(student => {
      const time = new Date().toLocaleTimeString();
      csvContent += `${student.sNo},${student.roll},${student.name},${time}\n`;
    });
    return new Blob([csvContent], { type: 'text/csv' });
  };

  const handleConfirmSave = async (e) => {
    e.preventDefault();
    if (!saveData.filename) {
      alert("Please enter a filename");
      return;
    }

    let finalFilename = saveData.filename;
    if (!finalFilename.endsWith('.csv') && !finalFilename.endsWith('.xlsx')) {
      finalFilename += '.csv';
    }

    try {
      // 1. Save attendance records to MongoDB via /api/attendance/live
      const attendanceFormData = new FormData();

      // Add uploaded images if any
      uploadedImages.forEach((img, idx) => {
        if (img.file) {
          attendanceFormData.append('images', img.file);
        }
      });

      // Add metadata
      attendanceFormData.append('course', saveData.course || 'Unknown Subject');
      attendanceFormData.append('class', className);
      attendanceFormData.append('hour', saveData.hour || '1');
      attendanceFormData.append('report_type', 'both');

      // Call the backend to save attendance records
      await takeLiveAttendance(attendanceFormData);

      // 2. Save Excel file to GridFS
      const fileBlob = generateCSV();
      const excelFormData = new FormData();
      excelFormData.append('file', fileBlob, finalFilename);
      excelFormData.append('course', saveData.course);
      excelFormData.append('class', className);
      excelFormData.append('hour', saveData.hour);
      excelFormData.append('type', saveData.type);

      await storeExcel(excelFormData);

      alert("Attendance Saved Successfully!");
      setShowModal(false);
      setSaveData({ filename: '', course: '', hour: '', type: 'Lecture' });
    } catch (err) {
      console.error(err);
      alert("Failed to save attendance: " + (err.response?.data?.error || err.message));
    }
  };

  // Manual Override Handler
  const handleManualOverrideSubmit = async ({ students, reason }) => {
    setIsSubmittingOverride(true);
    try {
      const facultyId = localStorage.getItem('facultyId');
      const facultyName = localStorage.getItem('teacherName');

      await submitManualOverride({
        students: students.map(s => ({ rollNo: s.rollNo, name: s.name })),
        reason,
        facultyId,
        facultyName,
        subject: saveData.course || className,
        period: saveData.hour || '1',
        className,
        date: new Date().toISOString().split('T')[0]
      });

      // Add to attendees with manual flag
      const newAttendees = [...attendees];
      students.forEach(student => {
        if (!newAttendees.find(a => a.roll === student.rollNo)) {
          newAttendees.push({
            sNo: newAttendees.length + 1,
            roll: student.rollNo,
            name: student.name,
            img: 'manual_override',
            isManualOverride: true,
            manualOverrideReason: reason
          });
        }
      });
      setAttendees(newAttendees.sort((a, b) => a.roll.localeCompare(b.roll)));

      setShowManualOverrideModal(false);
      alert(`Successfully marked ${students.length} student(s) as present via manual override.`);
    } catch (err) {
      console.error('Manual override failed:', err);
      alert('Failed to submit manual override. Please try again.');
    } finally {
      setIsSubmittingOverride(false);
    }
  };

  // Memoize expensive computations for performance
  const absentStudents = useMemo(() =>
    allStudents.filter(s => !attendees.find(a => a.roll === s.rollNo)),
    [allStudents, attendees]
  );

  // Manual Entry Handler
  const handleManualEntry = useCallback(() => {
    const rollNo = manualRollInput.trim().toUpperCase();

    if (!rollNo) {
      setManualEntryError('Please enter a roll number');
      return;
    }

    // Check if student exists
    const student = allStudents.find(s => s.rollNo.toUpperCase() === rollNo);

    if (!student) {
      setManualEntryError(`Student with roll number ${rollNo} not found`);
      return;
    }

    // Check if already marked present
    if (attendees.find(a => a.roll === student.rollNo)) {
      setManualEntryError(`${student.rollNo} is already marked present`);
      return;
    }

    // Mark as present
    setAttendees(prev => [...prev, {
      sNo: prev.length + 1,
      roll: student.rollNo,
      name: student.name,
      img: 'manual_entry',
      sources: ['manual_entry']
    }].sort((a, b) => a.roll.localeCompare(b.roll)));

    // Clear input and error
    setManualRollInput('');
    setManualEntryError('');
  }, [manualRollInput, allStudents, attendees]);

  // Bulk Action Handlers
  const handleMarkAllPresent = useCallback(() => {
    if (window.confirm(`Mark all ${allStudents.length} students as present?`)) {
      const newAttendees = allStudents.map((student, idx) => ({
        sNo: idx + 1,
        roll: student.rollNo,
        name: student.name,
        img: 'bulk_marked',
        sources: ['bulk_present']
      }));
      setAttendees(newAttendees.sort((a, b) => a.roll.localeCompare(b.roll)));
    }
  }, [allStudents]);

  const handleMarkAllAbsent = useCallback(() => {
    if (window.confirm('Mark all students as absent? This will clear the attendance list.')) {
      setAttendees([]);
    }
  }, []);

  const handleReset = useCallback(() => {
    if (window.confirm('Reset all attendance data? This cannot be undone.')) {
      handleClearAll();
    }
  }, [handleClearAll]);

  return (
    <div style={{ background: 'var(--bg-primary)', minHeight: '100vh', display: 'flex', flexDirection: 'column', transition: 'background var(--transition-theme)' }}>
      {/* Header */}
      <header style={{
        background: 'var(--bg-card)',
        borderBottom: '1px solid var(--border-color)',
        padding: '1rem 2rem',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        position: 'relative'
      }}>
        <div>
          <h1 style={{
            fontSize: '1.25rem',
            fontWeight: '600',
            color: 'var(--text-primary)',
            margin: 0
          }}>
            Live Attendance
          </h1>
          <p style={{
            fontSize: '0.875rem',
            color: 'var(--text-muted)',
            margin: 0
          }}>
            Class: {className}
          </p>
        </div>

        {/* Quick Mark by Roll Number - Moved to Header */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flex: 1, maxWidth: '400px', marginLeft: '2rem', marginRight: '2rem' }}>
          <input
            type="text"
            value={manualRollInput}
            onChange={(e) => {
              setManualRollInput(e.target.value);
              setManualEntryError('');
            }}
            onKeyPress={(e) => {
              if (e.key === 'Enter') {
                handleManualEntry();
              }
            }}
            placeholder="Quick mark by roll number..."
            style={{
              flex: 1,
              padding: '0.5rem 0.875rem',
              fontSize: '0.875rem',
              border: manualEntryError ? '1px solid #ef4444' : '1px solid var(--border-color)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontFamily: 'monospace',
              textTransform: 'uppercase'
            }}
          />
          <button
            onClick={handleManualEntry}
            style={{
              padding: '0.5rem 1rem',
              background: 'var(--success-color)',
              border: 'none',
              borderRadius: 'var(--radius-md)',
              color: 'white',
              fontSize: '0.875rem',
              fontWeight: '600',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            ✓ Mark
          </button>
          {manualEntryError && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '2rem',
              marginTop: '0.5rem',
              fontSize: '0.75rem',
              color: '#ef4444',
              padding: '0.5rem 0.75rem',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: 'var(--radius-sm)',
              border: '1px solid rgba(239, 68, 68, 0.3)',
              zIndex: 10,
              whiteSpace: 'nowrap'
            }}>
              ⚠️ {manualEntryError}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <button
            onClick={handleSaveClick}
            style={{
              background: 'var(--primary-color)',
              color: 'white',
              border: 'none',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              fontWeight: '500',
              cursor: 'pointer'
            }}
          >
            Save Report
          </button>
          <button
            onClick={() => navigate('/dashboard')}
            style={{
              background: 'var(--bg-hover)',
              border: '1px solid var(--border-color)',
              padding: '0.5rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.875rem',
              color: 'var(--text-secondary)',
              cursor: 'pointer'
            }}
          >
            ← Dashboard
          </button>
        </div>
      </header>

      {/* Main Content */}
      <div style={{
        display: 'flex',
        height: 'calc(100vh - 76px)', // Exact height minus header
        overflow: 'hidden',
        background: 'var(--bg-primary)',
        transition: 'background var(--transition-theme)'
      }}>
        {/* Left: Student List */}
        <div style={{
          width: '50%',
          borderRight: '1px solid var(--border-color)',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-card)',
          transition: 'background var(--transition-theme)'
        }}>
          {/* Table Header */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: '60px 110px 1fr 100px',
            padding: '0.75rem 1rem',
            background: 'var(--bg-hover)',
            borderBottom: '1px solid var(--border-color)',
            fontSize: '0.75rem',
            fontWeight: '600',
            color: 'var(--text-muted)',
            textTransform: 'uppercase'
          }}>
            <div>S.No</div>
            <div>Roll No</div>
            <div>Name</div>

            <div style={{ textAlign: 'center' }}>Status</div>
          </div>

          {/* Table Rows */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {allStudents.length === 0 ? (
              <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                No students enrolled in this section.
              </div>
            ) : (
              allStudents.map((student, idx) => {
                const isPresent = attendees.find(a => a.roll === student.rollNo);
                return (
                  <div
                    key={idx}
                    style={{
                      display: 'grid',
                      gridTemplateColumns: '60px 110px 1fr 100px',
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      alignItems: 'center',
                      background: isPresent
                        ? 'rgba(16, 185, 129, 0.15)'
                        : (idx % 2 === 0 ? 'var(--bg-card)' : 'var(--bg-hover)')
                    }}
                  >
                    <div style={{ color: 'var(--text-muted)', fontSize: '0.813rem', opacity: 0.8 }}>{idx + 1}</div>
                    <div style={{
                      fontFamily: 'monospace',
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      fontWeight: '700', // Increased to 700 for maximum visibility
                      letterSpacing: '0.05em'
                    }}>{student.rollNo}</div>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--text-primary)',
                      fontWeight: '600'
                    }}>{student.name}</div>


                    <div style={{ textAlign: 'center' }}>
                      {isPresent ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                          <span style={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '0.375rem',
                            padding: '0.25rem 0.625rem',
                            background: 'rgba(16, 185, 129, 0.15)',
                            color: 'var(--success-color)',
                            borderRadius: 'var(--radius-sm)',
                            fontSize: '0.75rem',
                            fontWeight: '700',
                            border: '1px solid rgba(16, 185, 129, 0.2)'
                          }}>
                            Present
                          </span>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem', fontWeight: '500' }}>Absent</span>
                      )}
                    </div>


                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right: Scanner */}
        <div style={{
          width: '50%',
          display: 'flex',
          flexDirection: 'column',
          background: 'var(--bg-secondary)',
          transition: 'background var(--transition-theme)',
          position: 'relative'
        }}>
          {/* Hidden File Input - Always Mounted */}
          <input
            type="file"
            accept="image/*"
            multiple
            ref={fileInputRef}
            style={{ display: 'none' }}
            onChange={handleFileUpload}
          />

          {/* Camera Area */}
          <div style={{
            flex: '1 1 auto',
            minHeight: '300px',
            background: '#0a0f1c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'relative',
            margin: '1rem',
            marginBottom: '0.5rem',
            borderRadius: 'var(--radius-xl)',
            overflow: 'hidden',
            border: '1px solid var(--border-color)',
            boxShadow: 'var(--shadow-lg)',
            transition: 'all 0.3s ease'
          }}>
            {isScanning ? (
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#000',
                padding: '1rem'
              }}>
                <div style={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      objectFit: 'contain',
                      borderRadius: 'var(--radius-md)',
                      boxShadow: '0 0 40px rgba(0,0,0,0.5)'
                    }}
                  />
                  <canvas ref={canvasRef} style={{
                    position: 'absolute',
                    top: '50%',
                    left: '50%',
                    transform: 'translate(-50%, -50%)',
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    pointerEvents: 'none'
                  }} />

                  {/* Scanning Header Badge */}
                  <div style={{
                    position: 'absolute',
                    top: '1rem',
                    left: '1rem',
                    background: 'rgba(59, 130, 246, 0.8)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    padding: '0.25rem 0.75rem',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.75rem',
                    fontWeight: '700',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem',
                    zIndex: 20
                  }}>
                    LIVE AI SCANNING
                  </div>

                  {/* No scan animation line as requested */}
                </div>

                <button
                  onClick={() => setIsScanning(false)}
                  style={{
                    position: 'absolute',
                    bottom: '2rem',
                    background: 'rgba(239, 68, 68, 0.95)',
                    backdropFilter: 'blur(8px)',
                    color: 'white',
                    border: '1px solid rgba(255,255,255,0.2)',
                    padding: '0.875rem 2.5rem',
                    borderRadius: 'var(--radius-xl)',
                    fontSize: '0.875rem',
                    fontWeight: '800',
                    cursor: 'pointer',
                    zIndex: 30,
                    boxShadow: '0 8px 32px rgba(239, 68, 68, 0.3)',
                    transition: 'all 0.2s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.5rem'
                  }}
                  onMouseEnter={(e) => e.target.style.transform = 'translateY(-2px) scale(1.05)'}
                  onMouseLeave={(e) => e.target.style.transform = 'translateY(0) scale(1)'}
                >
                  <span style={{ fontSize: '1.2rem' }}>⏹</span> STOP SCANNING
                </button>
              </div>
            ) : (
              <div style={{
                width: '100%',
                height: '100%',
                position: 'relative',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0a0f1c'
              }}>
                {uploadedImages.length > 0 ? (
                  // Image Preview UI
                  <div style={{
                    width: '100%',
                    height: '100%',
                    position: 'relative',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    background: '#000'
                  }}>
                    {/* Top Left: Clear Button */}
                    <button
                      onClick={handleClearAll}
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        left: '1rem',
                        zIndex: 20,
                        background: 'rgba(239, 68, 68, 0.2)',
                        border: '1px solid rgba(239, 68, 68, 0.5)',
                        color: '#fca5a5',
                        padding: '0.5rem 1rem',
                        borderRadius: 'var(--radius-md)',
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        cursor: 'pointer',
                        backdropFilter: 'blur(4px)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.4)';
                        e.target.style.color = 'white';
                      }}
                      onMouseLeave={(e) => {
                        e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                        e.target.style.color = '#fca5a5';
                      }}
                    >
                      <span>🗑</span> Clear
                    </button>

                    {/* Top Center: Image Counter */}
                    <div style={{
                      position: 'absolute',
                      top: '1rem',
                      left: '50%',
                      transform: 'translateX(-50%)',
                      zIndex: 20,
                      background: 'rgba(0, 0, 0, 0.6)',
                      color: 'white',
                      padding: '0.25rem 0.75rem',
                      borderRadius: '1rem',
                      fontSize: '0.75rem',
                      backdropFilter: 'blur(4px)'
                    }}>
                      {currentImageIndex + 1} / {uploadedImages.length}
                    </div>

                    {/* Top Right: Delete Current Image */}
                    <button
                      onClick={() => handleDeleteImage(currentImageIndex)}
                      title="Delete this image"
                      style={{
                        position: 'absolute',
                        top: '1rem',
                        right: '1rem',
                        zIndex: 20,
                        background: 'rgba(0, 0, 0, 0.5)',
                        border: 'none',
                        color: 'white',
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.2rem',
                        backdropFilter: 'blur(4px)',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.target.style.background = 'rgba(239, 68, 68, 0.8)'}
                      onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                    >
                      ×
                    </button>

                    {/* Left Arrow */}
                    {uploadedImages.length > 1 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : uploadedImages.length - 1)}
                        style={{
                          position: 'absolute',
                          left: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 20,
                          background: 'rgba(0,0,0,0.5)',
                          border: 'none',
                          color: 'white',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backdropFilter: 'blur(4px)'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                      >
                        ‹
                      </button>
                    )}

                    {/* Image Display */}
                    <img
                      src={uploadedImages[currentImageIndex]?.url}
                      alt={`Uploaded ${currentImageIndex + 1}`}
                      style={{
                        maxWidth: '100%',
                        maxHeight: '100%',
                        objectFit: 'contain'
                      }}
                    />

                    {/* Right Arrow */}
                    {uploadedImages.length > 1 && (
                      <button
                        onClick={() => setCurrentImageIndex(prev => prev < uploadedImages.length - 1 ? prev + 1 : 0)}
                        style={{
                          position: 'absolute',
                          right: '1rem',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          zIndex: 20,
                          background: 'rgba(0,0,0,0.5)',
                          border: 'none',
                          color: 'white',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          cursor: 'pointer',
                          fontSize: '1.5rem',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          backdropFilter: 'blur(4px)'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(255, 255, 255, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(0, 0, 0, 0.5)'}
                      >
                        ›
                      </button>
                    )}

                    {/* Bottom Right: Scan Button & Add Img */}
                    <div style={{
                      position: 'absolute',
                      bottom: '1rem',
                      right: '1rem',
                      zIndex: 20,
                      display: 'flex',
                      gap: '0.75rem'
                    }}>
                      {/* Scan Button - Only show if not yet scanned */}
                      {!uploadedImages[currentImageIndex]?.scanned && (
                        <button
                          onClick={handleScanImage}
                          disabled={processing}
                          style={{
                            background: 'var(--success-color)',
                            border: 'none',
                            color: 'white',
                            padding: '0.6rem 1.25rem',
                            borderRadius: 'var(--radius-lg)',
                            fontSize: '0.875rem',
                            fontWeight: '700',
                            cursor: processing ? 'wait' : 'pointer',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '0.5rem',
                            opacity: processing ? 0.8 : 1
                          }}
                        >
                          {processing ? (
                            <>
                              <span style={{ animation: 'spin 1s linear infinite', display: 'inline-block' }}>⌛</span> Scanning...
                            </>
                          ) : (
                            <>
                              <span>🔍</span> Scan Now
                            </>
                          )}
                        </button>
                      )}

                      {/* Scanned Badge */}
                      {uploadedImages[currentImageIndex]?.scanned && (
                        <div style={{
                          background: 'rgba(16, 185, 129, 0.9)',
                          color: 'white',
                          padding: '0.6rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.2)'
                        }}>
                          <span>✓</span> Scanned
                        </div>
                      )}

                      <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={processing}
                        style={{
                          background: 'var(--primary-color)',
                          border: 'none',
                          color: 'white',
                          padding: '0.6rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          cursor: processing ? 'wait' : 'pointer',
                          boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          opacity: processing ? 0.8 : 1
                        }}
                      >
                        <span>➕</span> Add Img
                      </button>

                      <button
                        onClick={() => setIsScanning(true)}
                        disabled={processing}
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)',
                          color: '#60a5fa',
                          padding: '0.6rem 1rem',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s'
                        }}
                        onMouseEnter={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.2)'}
                        onMouseLeave={(e) => e.target.style.background = 'rgba(59, 130, 246, 0.1)'}
                      >
                        <span>📷</span> Cam
                      </button>
                    </div>
                    <style>{`
                        @keyframes spin { 100% { transform: rotate(360deg); } }
                      `}</style>

                  </div>
                ) : (
                  // Default Scanner Ready UI
                  <div style={{
                    textAlign: 'center',
                    color: 'white',
                    padding: '1.5rem 1rem',
                    zIndex: 5,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    height: '100%'
                  }}>
                    <div style={{
                      width: '64px',
                      height: '64px',
                      background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.2), rgba(37, 99, 235, 0.1))',
                      border: '1px solid rgba(59, 130, 246, 0.3)',
                      borderRadius: '20px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      marginBottom: '1rem',
                      fontSize: '2rem',
                      boxShadow: '0 8px 32px rgba(0,0,0,0.3)',
                      backdropFilter: 'blur(10px)'
                    }}>
                      📸
                    </div>
                    <h2 style={{ margin: '0 0 0.25rem 0', fontWeight: '800', fontSize: '1.25rem', letterSpacing: '-0.02em', color: '#fff' }}>AI Scanner Ready</h2>
                    <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.813rem', marginBottom: '1.25rem', maxWidth: '280px', lineHeight: '1.4' }}>
                      Choose a source to begin identifying students.
                    </p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', width: '240px' }}>
                      <button
                        onClick={() => setIsScanning(true)}
                        style={{
                          background: '#3b82f6',
                          border: 'none',
                          color: 'white',
                          padding: '0.875rem',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.938rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          boxShadow: '0 8px 20px rgba(59, 130, 246, 0.4)',
                          transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                        onMouseEnter={(e) => e.target.style.background = '#2563eb'}
                        onMouseLeave={(e) => e.target.style.background = '#3b82f6'}
                      >
                        <span style={{ fontSize: '1rem' }}>▶</span> Start Camera
                      </button>
                      <button
                        onClick={() => fileInputRef.current.click()}
                        disabled={processing}
                        style={{
                          background: 'rgba(255,255,255,0.08)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          color: 'white',
                          padding: '0.875rem',
                          borderRadius: 'var(--radius-lg)',
                          fontSize: '0.938rem',
                          fontWeight: '600',
                          cursor: processing ? 'wait' : 'pointer',
                          transition: 'all 0.2s ease',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        {processing ? 'Processing...' : '📁 Upload Photos'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}

            <style>{`
              @keyframes scan-line {
                0%, 100% { top: 2%; opacity: 0.3; }
                50% { top: 98%; opacity: 1; }
              }
              @keyframes pulse {
                0% { opacity: 0.4; transform: scale(0.9); }
                50% { opacity: 1; transform: scale(1.1); }
                100% { opacity: 0.4; transform: scale(0.9); }
              }
            `}</style>
          </div>

          {/* Tabs */}
          <div style={{
            background: 'var(--bg-card)',
            borderTop: '1px solid var(--border-color)'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              borderBottom: '1px solid var(--border-color)',
              padding: '0.5rem 0.75rem',
              gap: '0.5rem'
            }}>
              {/* Tab Buttons */}
              <div style={{ display: 'flex', flex: 1 }}>
                <button
                  onClick={() => setActiveTab('present')}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'present' ? '2px solid var(--success-color)' : '2px solid transparent',
                    color: activeTab === 'present' ? 'var(--success-color)' : 'var(--text-muted)',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Present ({attendees.length})
                </button>
                <button
                  onClick={() => setActiveTab('absent')}
                  style={{
                    flex: 1,
                    padding: '0.875rem',
                    background: 'none',
                    border: 'none',
                    borderBottom: activeTab === 'absent' ? '2px solid var(--danger-color)' : '2px solid transparent',
                    color: activeTab === 'absent' ? 'var(--danger-color)' : 'var(--text-muted)',
                    fontWeight: '500',
                    cursor: 'pointer'
                  }}
                >
                  Absent ({absentStudents.length})
                </button>
              </div>

              {/* Bulk Action Buttons */}
              <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button
                  onClick={handleMarkAllPresent}
                  title="Mark all students present"
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(16, 185, 129, 0.1)',
                    border: '1px solid rgba(16, 185, 129, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--success-color)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(16, 185, 129, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ✓ All Present
                </button>
                <button
                  onClick={handleMarkAllAbsent}
                  title="Mark all students absent"
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'rgba(239, 68, 68, 0.1)',
                    border: '1px solid rgba(239, 68, 68, 0.3)',
                    borderRadius: 'var(--radius-md)',
                    color: '#ef4444',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.2)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'rgba(239, 68, 68, 0.1)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ✗ All Absent
                </button>
                <button
                  onClick={handleReset}
                  title="Reset all attendance"
                  style={{
                    padding: '0.5rem 0.75rem',
                    background: 'var(--bg-hover)',
                    border: '1px solid var(--border-color)',
                    borderRadius: 'var(--radius-md)',
                    color: 'var(--text-secondary)',
                    fontSize: '0.75rem',
                    fontWeight: '600',
                    cursor: 'pointer',
                    whiteSpace: 'nowrap',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.background = 'var(--bg-secondary)';
                    e.target.style.transform = 'translateY(-1px)';
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.background = 'var(--bg-hover)';
                    e.target.style.transform = 'translateY(0)';
                  }}
                >
                  ↻ Reset
                </button>
              </div>
            </div>

            <div style={{ flex: 1, minHeight: '180px', maxHeight: '240px', overflowY: 'auto', padding: '0.5rem' }}>
              {activeTab === 'present' ? (
                attendees.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem', opacity: 0.5 }}>👥</div>
                    Waiting for detections...
                  </div>
                ) : (
                  [...attendees].sort((a, b) => a.roll.localeCompare(b.roll)).map((student, idx) => (
                    <div key={idx} style={{
                      padding: '0.75rem 1rem',
                      borderBottom: '1px solid var(--border-color)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      background: 'var(--bg-card)'
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--success-color)', fontSize: '0.875rem' }}>{student.roll}</span>
                        <span style={{ color: 'var(--text-primary)', fontWeight: '500', fontSize: '0.875rem' }}>{student.name}</span>
                      </div>
                      <span style={{ color: 'var(--success-color)', fontSize: '0.75rem', fontWeight: '600' }}>✓ In View</span>
                    </div>
                  ))
                )
              ) : (
                absentStudents.length === 0 ? (
                  <div style={{ padding: '2.5rem 1rem', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                    <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>✅</div>
                    Excellent! Class is full.
                  </div>
                ) : (
                  <>
                    {absentStudents.sort((a, b) => a.rollNo.localeCompare(b.rollNo)).map((student, idx) => (
                      <div key={idx} style={{
                        padding: '0.75rem 1rem',
                        borderBottom: '1px solid var(--border-color)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        background: 'var(--bg-card)'
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <span style={{ fontFamily: 'monospace', fontWeight: '700', color: 'var(--text-muted)', fontSize: '0.875rem' }}>{student.rollNo}</span>
                          <span style={{ color: 'var(--text-secondary)', fontWeight: '500', fontSize: '0.875rem' }}>{student.name}</span>
                        </div>
                        <span style={{ color: 'var(--danger-color)', fontSize: '0.75rem', fontWeight: '600' }}>Absent</span>
                      </div>
                    ))}
                    {/* Manual Override Button - Helpful fall-back */}
                    <div style={{ padding: '1.25rem 1rem', background: 'rgba(59, 130, 246, 0.03)', borderTop: '1px solid var(--border-color)', textAlign: 'center' }}>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.75rem' }}>
                        Face not recognized? Use manual override as a fallback.
                      </p>
                      <button
                        onClick={() => setShowManualOverrideModal(true)}
                        style={{
                          width: '100%',
                          padding: '0.75rem',
                          background: 'transparent',
                          border: '1px dashed var(--primary-color)',
                          borderRadius: 'var(--radius-lg)',
                          color: 'var(--primary-color)',
                          fontSize: '0.813rem',
                          fontWeight: '700',
                          cursor: 'pointer',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem',
                          transition: 'all 0.2s ease'
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = 'rgba(59, 130, 246, 0.1)';
                          e.currentTarget.style.transform = 'translateY(-1px)';
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = 'transparent';
                          e.currentTarget.style.transform = 'translateY(0)';
                        }}
                      >
                        <span>✍️</span>
                        <span>Request Manual Override</span>
                      </button>
                    </div>
                  </>
                )
              )}
            </div>

          </div>
        </div>
      </div>

      {/* Save Modal */}
      {
        showModal && (
          <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(15, 23, 42, 0.5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '1rem'
          }}>
            <div style={{
              background: 'var(--bg-card)',
              borderRadius: 'var(--radius-xl)',
              boxShadow: 'var(--shadow-lg)',
              width: '100%',
              maxWidth: '420px',
              padding: '2rem'
            }}>
              <h3 style={{
                fontSize: '1.25rem',
                fontWeight: '600',
                color: 'var(--text-primary)',
                marginBottom: '1.5rem'
              }}>
                Save Attendance Report
              </h3>

              <form onSubmit={handleConfirmSave}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    Filename
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. DS_Lecture_10AM"
                    value={saveData.filename}
                    onChange={(e) => setSaveData({ ...saveData, filename: e.target.value })}
                    required
                    autoFocus
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none'
                    }}
                  />
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)'
                    }}>
                      Course ID
                    </label>
                    <input
                      type="text"
                      placeholder="CS101"
                      value={saveData.course}
                      onChange={(e) => setSaveData({ ...saveData, course: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none'
                      }}
                    />
                  </div>
                  <div>
                    <label style={{
                      display: 'block',
                      marginBottom: '0.5rem',
                      fontSize: '0.875rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)'
                    }}>
                      Hour
                    </label>
                    <input
                      type="text"
                      placeholder="1"
                      value={saveData.hour}
                      onChange={(e) => setSaveData({ ...saveData, hour: e.target.value })}
                      required
                      style={{
                        width: '100%',
                        padding: '0.75rem 1rem',
                        fontSize: '1rem',
                        border: '1px solid var(--border-color)',
                        borderRadius: 'var(--radius-md)',
                        outline: 'none'
                      }}
                    />
                  </div>
                </div>

                <div style={{ marginBottom: '1.5rem' }}>
                  <label style={{
                    display: 'block',
                    marginBottom: '0.5rem',
                    fontSize: '0.875rem',
                    fontWeight: '500',
                    color: 'var(--text-primary)'
                  }}>
                    Type
                  </label>
                  <select
                    value={saveData.type}
                    onChange={(e) => setSaveData({ ...saveData, type: e.target.value })}
                    style={{
                      width: '100%',
                      padding: '0.75rem 1rem',
                      fontSize: '1rem',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      outline: 'none',
                      background: 'white'
                    }}
                  >
                    <option value="Lecture">Lecture</option>
                    <option value="Lab">Lab</option>
                    <option value="Exam">Exam</option>
                  </select>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem' }}>
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--bg-hover)',
                      border: '1px solid var(--border-color)',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.938rem',
                      fontWeight: '500',
                      color: 'var(--text-primary)',
                      cursor: 'pointer'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '0.75rem',
                      background: 'var(--primary-color)',
                      border: 'none',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '0.938rem',
                      fontWeight: '500',
                      color: 'white',
                      cursor: 'pointer'
                    }}
                  >
                    Save
                  </button>
                </div>
              </form>
            </div>
          </div>
        )
      }

      {/* Manual Override Modal */}
      {
        showManualOverrideModal && (
          <ManualOverrideModal
            absentStudents={absentStudents}
            onClose={() => setShowManualOverrideModal(false)}
            onSubmit={handleManualOverrideSubmit}
            classInfo={{
              className,
              subject: saveData.course || className,
              date: new Date().toLocaleDateString()
            }}
            isSubmitting={isSubmittingOverride}
          />
        )
      }
    </div>
  );
};

export default LiveAttendance;