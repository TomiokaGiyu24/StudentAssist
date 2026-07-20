import katex from 'katex';

/**
 * Generate and download PDF from chapter content
 */
export async function exportChapterToPDF(chapterContent, subjectName = 'Physics') {
  const isArrayContent = Array.isArray(chapterContent);
  const firstTopicMeta = isArrayContent ? chapterContent[0]?.meta : null;
  const chapterName = isArrayContent 
        ? (firstTopicMeta?.chapter_name || 'Chapter Notes')
        : (chapterContent.meta?.chapter || chapterContent.chapter || 'Chapter Notes');

  const htmlContent = buildContent(chapterContent, chapterName, subjectName);

  // Create an invisible iframe for printing
  const iframe = document.createElement('iframe');
  iframe.style.position = 'fixed';
  iframe.style.right = '0';
  iframe.style.bottom = '0';
  iframe.style.width = '0';
  iframe.style.height = '0';
  iframe.style.border = 'none';
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow.document;
  doc.open();
  doc.write(`
    <!DOCTYPE html>
    <html>
      <head>
        <title>${chapterName.replace(/[^a-zA-Z0-9\s]/g, '').trim().replace(/\s+/g, '_')}_Notes</title>
        <style>
          @page { size: A4 portrait; margin: 15mm 20mm; }
          body { 
            font-family: Georgia, 'Times New Roman', serif;
            font-size: 11pt;
            line-height: 1.6;
            color: #1a1a1a;
            background: white;
            margin: 0;
            padding: 0;
            -webkit-print-color-adjust: exact;
            print-color-adjust: exact;
          }
        </style>
      </head>
      <body>
        ${htmlContent}
      </body>
    </html>
  `);
  doc.close();

  // Wait for KaTeX CSS and fonts to load before printing
  await new Promise(resolve => setTimeout(resolve, 800));

  try {
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  } catch (err) {
    console.error('Error printing PDF:', err);
  } finally {
    // Cleanup the iframe after print dialog opens
    setTimeout(() => {
      if (document.body.contains(iframe)) {
        document.body.removeChild(iframe);
      }
    }, 2000);
  }
}

/**
 * Build all content HTML
 */
function buildContent(chapterContent, chapterName, subjectName) {
  const isArrayContent = Array.isArray(chapterContent);
  const topics = isArrayContent ? chapterContent : [chapterContent];
  
  const allFormulas = isArrayContent ? chapterContent.flatMap(t => t.formula_sheet || []) : (chapterContent.formula_sheet || []);
  const allGoldenLines = isArrayContent ? chapterContent.flatMap(t => t.ncert_golden_lines || []) : (chapterContent.ncert_golden_lines || []);
  const allUltimateShortNotes = isArrayContent ? chapterContent.flatMap(t => t.ultimate_short_notes || []) : (chapterContent.ultimate_short_notes || []);
  const allFormulaBank = isArrayContent ? chapterContent.flatMap(t => t.formula_bank || []) : (chapterContent.formula_bank || []);
  const allDiagramDescriptors = isArrayContent ? chapterContent.flatMap(t => t.diagram_descriptors || []) : (chapterContent.diagram_descriptors || []);
  const allExamPlaybook = isArrayContent ? chapterContent.flatMap(t => t.exam_playbook || []) : (chapterContent.exam_playbook || []);
  const allSureShot = isArrayContent ? chapterContent.flatMap(t => t.sure_shot_questions || []) : (chapterContent.sure_shot_questions || []);
  const allExaminerTraps = isArrayContent ? chapterContent.flatMap(t => t.examiner_traps || []) : (chapterContent.examiner_traps || []);

  let html = `
    <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
    <style>
      * { box-sizing: border-box; }
      
      .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 15px; margin-bottom: 25px; }
      .header h1 { font-size: 22pt; margin: 0 0 8px 0; color: #1a1a1a; }
      .header .subtitle { font-size: 12pt; color: #666; }
      
      .section { margin-bottom: 25px; }
      .section-title { font-size: 16pt; color: #1a1a1a; border-bottom: 1px solid #ddd; padding-bottom: 8px; margin-bottom: 18px; }
      
      .concept-block { background: #f0f9ff; border-left: 4px solid #3b82f6; padding: 12px 16px; margin-bottom: 15px; }
      .concept-title { font-size: 12pt; font-weight: bold; color: #1e40af; margin-bottom: 8px; }
      .concept-block ul { margin: 0; padding-left: 18px; }
      .concept-block li { margin-bottom: 5px; line-height: 1.5; }
      
      .formula-block { background: #eef2ff; border: 1px solid #c7d2fe; border-radius: 6px; padding: 15px; margin: 15px 0; text-align: center; }
      .formula-label { font-weight: bold; color: #4338ca; margin-bottom: 10px; font-size: 11pt; }
      .formula-conditions { margin-top: 10px; font-size: 9pt; color: #555; text-align: left; border-top: 1px solid #e0e7ff; padding-top: 8px; }
      .formula-conditions ul { margin: 4px 0 0 0; padding-left: 16px; }
      
      .derived-block { background: #fef3c7; border-left: 4px solid #f59e0b; padding: 12px 16px; margin: 15px 0; }
      .derived-badge { display: inline-block; background: #f59e0b; color: white; font-size: 8pt; padding: 2px 8px; border-radius: 3px; margin-bottom: 8px; }
      .derived-statement { font-weight: bold; margin-bottom: 8px; }
      .derived-valid { font-size: 9pt; color: #92400e; font-style: italic; margin-top: 8px; }
      
      .app-block { background: #ecfdf5; border-left: 4px solid #10b981; padding: 12px 16px; margin: 15px 0; }
      .app-badge { display: inline-block; background: #10b981; color: white; font-size: 8pt; padding: 2px 8px; border-radius: 3px; margin-bottom: 8px; }
      .app-title { font-weight: bold; font-size: 12pt; margin-bottom: 8px; }
      .app-result { background: white; padding: 10px; border-radius: 4px; text-align: center; margin-top: 8px; }
      .app-direction { font-size: 9pt; color: #047857; margin-top: 6px; }
      
      .diagram-block { text-align: center; padding: 12px; background: #fafafa; border: 1px dashed #ccc; border-radius: 6px; margin: 15px 0; }
      .diagram-title { font-weight: bold; margin-bottom: 8px; }
      .diagram-caption { font-size: 9pt; color: #666; font-style: italic; }
      
      .formula-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 6px; padding: 12px; margin-bottom: 10px; }
      .formula-math { text-align: center; margin-bottom: 6px; padding: 8px 0; }
      .formula-desc { font-weight: 600; font-size: 10pt; color: #334155; }
      .formula-use { font-size: 9pt; color: #64748b; }
      
      .golden-line { background: #fffbeb; border-left: 3px solid #fbbf24; padding: 10px 14px; margin-bottom: 10px; font-style: italic; font-size: 10.5pt; }
      .golden-num { color: #92400e; font-weight: bold; font-style: normal; }

      .intel-block { background: #fdf4ff; border-left: 4px solid #c026d3; padding: 12px 16px; margin: 15px 0; }
      .intel-title { font-weight: bold; color: #a21caf; margin-bottom: 8px; font-size: 11pt; }
      .intel-section { margin-top: 8px; font-size: 10pt; }
      .intel-label { font-weight: bold; color: #86198f; }

      .recall-block { background: #fff1f2; border-left: 4px solid #e11d48; padding: 12px 16px; margin: 15px 0; }
      .recall-title { font-weight: bold; color: #be123c; margin-bottom: 8px; font-size: 11pt; }
      .recall-text { font-size: 10pt; margin-bottom: 6px; }
      .recall-label { font-weight: bold; color: #9f1239; }
      
      /* PE specific styles */
      .pe-note-block { margin-bottom: 20px; page-break-inside: avoid; }
      .pe-note-title { font-weight: bold; font-size: 12pt; margin-bottom: 8px; color: #1c1917; border-bottom: 1px solid #e7e5e4; padding-bottom: 4px; }
      .pe-note-content li { margin-bottom: 6px; color: #44403c; }
      
      .pe-question { background: #fafaf9; border: 1px solid #e7e5e4; padding: 15px; margin-bottom: 15px; border-radius: 8px; page-break-inside: avoid; }
      .pe-q-header { display: flex; justify-content: space-between; margin-bottom: 10px; font-weight: bold; color: #1c1917; }
      .pe-q-marks { background: #fbbf24; color: white; padding: 2px 8px; border-radius: 10px; font-size: 9pt; }
      .pe-model-answer { background: #f0fdf4; border: 1px solid #dcfce7; padding: 10px; margin-top: 10px; border-radius: 6px; }
      .pe-answer-label { font-size: 9pt; color: #16a34a; font-weight: bold; margin-bottom: 4px; }
      
      .pe-strategy { background: #eff6ff; border-left: 4px solid #3b82f6; padding: 12px; margin-bottom: 15px; page-break-inside: avoid; }
      .pe-strategy-title { color: #1e40af; font-weight: bold; margin-bottom: 8px; }
      
      .footer { margin-top: 30px; padding-top: 15px; border-top: 1px solid #ddd; text-align: center; font-size: 9pt; color: #999; }
      
      /* KaTeX dark text for PDF */
      .katex { font-size: 1.1em !important; }
      .katex, .katex * { color: #1a1a1a !important; }
      .katex .frac-line { background-color: #1a1a1a !important; }
      .katex .mfrac .frac-line { border-color: #1a1a1a !important; min-height: 1px !important; }
    </style>
  `;

  // Header
  html += `
    <div class="header">
      <h1>${escapeHtml(chapterName)}</h1>
      <div class="subtitle">${escapeHtml(subjectName)} - Class 12 CBSE</div>
    </div>
  `;

  // --- Physics/Chemistry/Math Logic ---

  // Notes Section
  const hasNotes = topics.some(t => t.notes && t.notes.length > 0);
  if (hasNotes) {
    html += `<div class="section"><div class="section-title">Chapter Notes</div>`;
    for (const topic of topics) {
      if (isArrayContent && topic.meta?.topic) {
        html += `<div class="topic-header" style="font-size: 14pt; color: #1e40af; font-weight: bold; margin-top: 20px; margin-bottom: 10px; border-bottom: 1px solid #bfdbfe; padding-bottom: 4px;">${escapeHtml(topic.meta.topic)}</div>`;
      }
      if (topic.notes) {
        for (const item of topic.notes) {
          html += renderNoteBlock(item);
        }
      }
    }
    html += `</div>`;
  }

  // Formula Sheet
  if (allFormulas && allFormulas.length > 0) {
    html += `<div class="section"><div class="section-title">Formula Sheet</div>`;
    for (const f of allFormulas) {
      html += `
        <div class="formula-card">
          <div class="formula-math">${renderLatex(f.latex)}</div>
          <div class="formula-desc">${escapeHtml(f.description)}</div>
          <div class="formula-use">${escapeHtml(f.use_case || '')}</div>
        </div>`;
    }
    html += `</div>`;
  }

  // Golden Lines
  if (allGoldenLines && allGoldenLines.length > 0) {
    html += `<div class="section"><div class="section-title">Key NCERT Statements</div>`;
    allGoldenLines.forEach((line, i) => {
      html += `<div class="golden-line"><span class="golden-num">${i + 1}.</span> "${escapeHtml(line)}"</div>`;
    });
    html += `</div>`;
  }

  // --- Physical Education Logic ---

  // Ultimate Short Notes
  if (allUltimateShortNotes && allUltimateShortNotes.length > 0) {
    html += `<div class="section"><div class="section-title">Study Notes</div>`;
    allUltimateShortNotes.forEach(note => {
      html += `
            <div class="pe-note-block">
                <div class="pe-note-title">${escapeHtml(note.heading)}</div>
                <ul class="pe-note-content">
                    ${(note.content || note.points || []).map(p => `<li>${renderInlineLatex(p)}</li>`).join('')}
                </ul>
            </div>
          `;
    });
    html += `</div>`;
  }

  // PE Formulas
  if (allFormulaBank && allFormulaBank.length > 0) {
    html += `<div class="section"><div class="section-title">Key Formulas</div>`;
    allFormulaBank.forEach(f => {
      html += `
            <div class="formula-card">
              <div class="formula-desc" style="text-align:center;margin-bottom:4px">${escapeHtml(f.concept)}</div>
              <div class="formula-math">${renderLatex(f.formula)}</div>
              <div class="formula-use" style="text-align:center">${escapeHtml(f.used_in_questions || '')}</div>
            </div>`;
    });
    html += `</div>`;
  }

  // Diagram Descriptors
  if (allDiagramDescriptors && allDiagramDescriptors.length > 0) {
    html += `<div class="section"><div class="section-title">Key Diagrams</div>`;
    allDiagramDescriptors.forEach(d => {
      html += `
            <div class="diagram-block">
                 <div class="diagram-title">${escapeHtml(d.diagram_name)}</div>
                 ${d.detailed_description ? `<div style="font-size:10pt;color:#444;margin-top:5px">${escapeHtml(d.detailed_description)}</div>` : ''}
                 ${d.used_for ? `<div class="diagram-caption" style="margin-top:5px">Used for: ${escapeHtml(d.used_for)}</div>` : ''}
            </div>
          `;
    });
    html += `</div>`;
  }

  // Exam Playbook
  if (allExamPlaybook && allExamPlaybook.length > 0) {
    html += `<div class="section"><div class="section-title">Exam Playbook</div>`;
    allExamPlaybook.forEach(s => {
      html += `
            <div class="pe-strategy">
                <div class="pe-strategy-title">${escapeHtml(s.strategy_name)} <span style="font-weight:normal;font-size:9pt;color:#666">(${escapeHtml(s.marks_secured)})</span></div>
                <div style="font-size:10pt;margin-bottom:6px"><strong>Pattern:</strong> ${renderInlineLatex(s.pyq_pattern)}</div>
                <div style="font-size:10pt;color:#dc2626;margin-bottom:6px"><strong>Avoid:</strong> ${renderInlineLatex(s.how_students_lose_marks)}</div>
                <div style="font-size:10pt;color:#16a34a"><strong>Winning Approach:</strong> ${renderInlineLatex(s.winning_approach)}</div>
            </div>
          `;
    });
    html += `</div>`;
  }

  // Sure Shot Questions
  if (allSureShot && allSureShot.length > 0) {
    html += `<div class="section"><div class="section-title">Sure Shot Questions</div>`;
    allSureShot.forEach(q => {
      html += `
            <div class="pe-question">
                <div class="pe-q-header">
                    <span>${renderInlineLatex(q.question)}</span>
                    <span class="pe-q-marks">${q.marks} Marks</span>
                </div>
                ${q.mandatory_keywords ? `
                    <div style="font-size:9pt;color:#666;margin-bottom:8px">
                        <strong>Keywords:</strong> ${q.mandatory_keywords.join(', ')}
                    </div>
                ` : ''}
                ${q.model_answer_outline ? `
                    <div class="pe-model-answer">
                        <div class="pe-answer-label">Model Answer Outline</div>
                        <ul style="margin:0;padding-left:18px;font-size:10pt">
                             ${q.model_answer_outline.map(line => `<li>${renderInlineLatex(line)}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
          `;
    });
    html += `</div>`;
  }

  // Examiner Traps
  if (allExaminerTraps && allExaminerTraps.length > 0) {
    html += `<div class="section"><div class="section-title">Examiner Traps</div>`;
    allExaminerTraps.forEach(t => {
      html += `
            <div class="pe-strategy" style="border-left-color:#ef4444;background:#fef2f2">
                <div class="pe-strategy-title" style="color:#b91c1c">Mistake: ${escapeHtml(t.common_mistake)}</div>
                <ul style="margin:0;padding-left:18px;font-size:10pt">
                    <li><span style="color:#dc2626">Why marks cut:</span> ${renderInlineLatex(t.why_marks_are_cut)}</li>
                    <li><span style="color:#16a34a">Correct approach:</span> ${renderInlineLatex(t.correct_examiner_expectation)}</li>
                </ul>
            </div>
          `;
    });
    html += `</div>`;
  }

  // Footer
  html += `<div class="footer">Generated by StudyAssist - ${new Date().toLocaleDateString()}</div>`;

  return html;
}

/**
 * Render a note block
 */
function renderNoteBlock(item) {
  switch (item.type) {
    case 'concept':
      return `
        <div class="concept-block">
          <div class="concept-title">${escapeHtml(item.title)}</div>
          <ul>${(item.points || []).map(p => `<li>${renderInlineLatex(p)}</li>`).join('')}</ul>
        </div>`;

    case 'exam_intel':
      return `
        <div class="intel-block">
          <div class="intel-title">⚡ Exam Intel: ${escapeHtml(item.concept_ref)}</div>
          <div class="intel-section">
            <span class="intel-label">Frequency:</span> ${escapeHtml(item.frequency)} 
            (${escapeHtml((item.marks_breakdown || []).join(', '))})
          </div>
          ${item.question_forms && item.question_forms.length > 0 ? `
            <div class="intel-section">
              <div class="intel-label">Question Forms:</div>
              <ul style="margin:4px 0 0 0;padding-left:16px">
                ${item.question_forms.map(q => `<li>${renderInlineLatex(q)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${item.common_mistakes && item.common_mistakes.length > 0 ? `
            <div class="intel-section">
              <div class="intel-label">Common Mistakes:</div>
              <ul style="margin:4px 0 0 0;padding-left:16px;color:#9f1239">
                ${item.common_mistakes.map(m => `<li>${renderInlineLatex(m)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>`;

    case 'rapid_recall':
      return `
        <div class="recall-block">
          <div class="recall-title">🧠 Rapid Recall: ${escapeHtml(item.concept_ref)}</div>
          <div class="recall-text"><strong>One Liner:</strong> ${renderInlineLatex(item.one_liner)}</div>
          <div class="recall-text"><strong>Memory Hook:</strong> ${renderInlineLatex(item.memory_hook)}</div>
          ${item.never_forget && item.never_forget.length > 0 ? `
            <div class="recall-text">
              <div class="recall-label">Never Forget:</div>
              <ul style="margin:4px 0 0 0;padding-left:16px">
                ${item.never_forget.map(nf => `<li>${renderInlineLatex(nf)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
        </div>`;

    case 'formula':
      return `
        <div class="formula-block">
          ${item.label ? `<div class="formula-label">${escapeHtml(item.label)}</div>` : ''}
          <div>${renderLatex(item.latex)}</div>
          ${item.conditions && item.conditions.length > 0 ? `
            <div class="formula-conditions">
              <strong>Where:</strong>
              <ul>${item.conditions.map(c => `<li>${renderInlineLatex(c)}</li>`).join('')}</ul>
            </div>
          ` : ''}
        </div>`;

    case 'derived_result':
      return `
        <div class="derived-block">
          <div class="derived-badge">DERIVED RESULT</div>
          <div class="derived-statement">${escapeHtml(item.statement)}</div>
          <div style="text-align:center">${renderLatex(item.latex)}</div>
          ${item.valid_when ? `<div class="derived-valid">Valid: ${renderInlineLatex(item.valid_when)}</div>` : ''}
        </div>`;

    case 'application':
      return `
        <div class="app-block">
          <div class="app-badge">APPLICATION</div>
          <div class="app-title">${escapeHtml(item.title)}</div>
          ${item.assumptions && item.assumptions.length > 0 ? `
            <div style="font-size:10pt;margin-bottom:8px">
              <strong>Given:</strong>
              <ul style="margin:4px 0 0 0;padding-left:16px">
                ${item.assumptions.map(a => `<li>${renderInlineLatex(a)}</li>`).join('')}
              </ul>
            </div>
          ` : ''}
          ${item.result ? `
            <div class="app-result">
              ${renderLatex(item.result.latex)}
              ${item.result.direction ? `<div class="app-direction">${escapeHtml(item.result.direction)}</div>` : ''}
            </div>
          ` : ''}
        </div>`;

    case 'diagram':
      return `
        <div class="diagram-block">
          <div class="diagram-title">${escapeHtml(item.title || 'Diagram')}</div>
          <div style="padding:15px;color:#888">[Diagram: ${escapeHtml(item.title || '')}]</div>
          ${item.caption ? `<div class="diagram-caption">${escapeHtml(item.caption)}</div>` : ''}
        </div>`;

    default:
      return '';
  }
}

/**
 * Render LaTeX to HTML string
 */
function renderLatex(latex) {
  if (!latex) return '';
  try {
    return katex.renderToString(latex, {
      throwOnError: false,
      displayMode: true
    });
  } catch (e) {
    return `<code style="background:#fee2e2;padding:2px 6px;border-radius:3px;color:#1a1a1a">${escapeHtml(latex)}</code>`;
  }
}

/**
 * Render inline LaTeX in text
 */
function renderInlineLatex(text) {
  if (!text) return '';
  let result = escapeHtml(text);
  const matches = text.match(/\$[^$]+\$/g);
  if (matches) {
    matches.forEach(m => {
      try {
        const rendered = katex.renderToString(m.slice(1, -1), {
          throwOnError: false,
          displayMode: false
        });
        result = result.replace(escapeHtml(m), rendered);
      } catch (e) {
        // Keep original on error
      }
    });
  }
  return result;
}

/**
 * Escape HTML special characters
 */
function escapeHtml(text) {
  if (!text) return '';
  return String(text)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export default exportChapterToPDF;
