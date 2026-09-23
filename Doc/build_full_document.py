# -*- coding: utf-8 -*-
"""
Script to generate the complete, detailed DOCX specification document for:
HỆ THỐNG QUẢN LÝ NHÀ TRỌ HỖ TRỢ GHÉP NGƯỜI Ở CHUNG
Based on the exact template requested by the user.
Style requirements: Black text, white background, bold/normal headers, no colorful themes, clean academic standard.
"""

import os
import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT, WD_ALIGN_VERTICAL
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

def create_element(name):
    return OxmlElement(name)

def set_cell_margins(cell, top=100, bottom=100, left=150, right=150):
    tc = cell._tc
    tcPr = tc.get_or_add_tcPr()
    tcMar = OxmlElement('w:tcMar')
    for m, val in [('top', top), ('bottom', bottom), ('left', left), ('right', right)]:
        node = OxmlElement(f'w:{m}')
        node.set(qn('w:w'), str(val))
        node.set(qn('w:type'), 'dxa')
        tcMar.append(node)
    tcPr.append(tcMar)

def set_table_borders(table):
    tblPr = table._tbl.tblPr
    tblBorders = parse_xml(
        r'<w:tblBorders %s>'
        r'  <w:top w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        r'  <w:bottom w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        r'  <w:insideH w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        r'  <w:insideV w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        r'  <w:left w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        r'  <w:right w:val="single" w:sz="4" w:space="0" w:color="000000"/>'
        r'</w:tblBorders>' % nsdecls('w')
    )
    tblPr.append(tblBorders)

def add_table_to_doc(doc, headers, rows_data, col_widths=None):
    table = doc.add_table(rows=len(rows_data) + 1, cols=len(headers))
    table.alignment = WD_TABLE_ALIGNMENT.CENTER
    set_table_borders(table)

    # Format header row
    hdr_cells = table.rows[0].cells
    for i, title in enumerate(headers):
        hdr_cells[i].text = title
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=140, right=140)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0, 0, 0)
        # Ensure white shading (no background color)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="FFFFFF"/>')
        hdr_cells[i]._tc.get_or_add_tcPr().append(shd)

    # Format data rows
    for r_idx, row_values in enumerate(rows_data):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row_values):
            row_cells[c_idx].text = str(val)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=120, right=120)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
            # If first column or numbers, center; else left
            if c_idx == 0 or len(str(val)) <= 6 or str(val).isdigit():
                p.alignment = WD_ALIGN_PARAGRAPH.CENTER
            else:
                p.alignment = WD_ALIGN_PARAGRAPH.LEFT
            for r in p.runs:
                r.font.name = 'Times New Roman'
                r.font.size = Pt(9.5)
                r.font.color.rgb = RGBColor(0, 0, 0)
            shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="FFFFFF"/>')
            row_cells[c_idx]._tc.get_or_add_tcPr().append(shd)

    # Apply column widths if provided
    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(4)

def add_usecase(doc, uc_data):
    """
    uc_data structure:
    {
        "stt": 1,
        "role": "Chủ trọ",
        "chuc_nang": "...",
        "use_case": "...",
        "actor": "...",
        "tien_dieu_kien": "...",
        "hau_dieu_kien": "...",
        "kich_ban_chinh": [
            ("text", "1. Người dùng làm gì..."),
            ("text", "2. Hệ thống hiển thị giao diện gồm..."),
            ("table", headers, rows_data, col_widths),
            ...
        ],
        "ngoai_le": [
            "4. Ngoại lệ bước 4...",
            "8. Ngoại lệ bước 8..."
        ]
    }
    """
    # Title / Heading
    h = doc.add_heading(level=2)
    h.paragraph_format.space_before = Pt(12)
    h.paragraph_format.space_after = Pt(4)
    run_h = h.add_run(f"Use Case {uc_data['stt']}: {uc_data['use_case']} ({uc_data['chuc_nang']})")
    run_h.font.name = 'Times New Roman'
    run_h.font.size = Pt(13)
    run_h.font.bold = True
    run_h.font.color.rgb = RGBColor(0, 0, 0)

    # Meta information in paragraph format matching template
    fields = [
        ("Chức năng:", uc_data['chuc_nang']),
        ("Use case:", uc_data['use_case']),
        ("Actor:", uc_data['actor']),
        ("Tiền điều kiện:", uc_data['tien_dieu_kien']),
        ("Hậu điều kiện:", uc_data['hau_dieu_kien']),
    ]

    for label, val in fields:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        p.paragraph_format.line_spacing = 1.15
        r_lbl = p.add_run(label + " ")
        r_lbl.font.name = 'Times New Roman'
        r_lbl.font.size = Pt(11)
        r_lbl.font.bold = True
        r_lbl.font.color.rgb = RGBColor(0, 0, 0)

        r_val = p.add_run(val)
        r_val.font.name = 'Times New Roman'
        r_val.font.size = Pt(11)
        r_val.font.color.rgb = RGBColor(0, 0, 0)

    # Kịch bản chính
    p_kb = doc.add_paragraph()
    p_kb.paragraph_format.space_before = Pt(4)
    p_kb.paragraph_format.space_after = Pt(2)
    r_kb = p_kb.add_run("Kịch bản chính:")
    r_kb.font.name = 'Times New Roman'
    r_kb.font.size = Pt(11)
    r_kb.font.bold = True
    r_kb.font.color.rgb = RGBColor(0, 0, 0)

    for item in uc_data['kich_ban_chinh']:
        if item[0] == "text":
            p_step = doc.add_paragraph()
            p_step.paragraph_format.space_before = Pt(2)
            p_step.paragraph_format.space_after = Pt(2)
            p_step.paragraph_format.line_spacing = 1.15
            p_step.paragraph_format.left_indent = Inches(0.2)
            r_step = p_step.add_run(item[1])
            r_step.font.name = 'Times New Roman'
            r_step.font.size = Pt(11)
            r_step.font.color.rgb = RGBColor(0, 0, 0)
        elif item[0] == "table":
            headers = item[1]
            rows_data = item[2]
            col_widths = item[3] if len(item) > 3 else None
            add_table_to_doc(doc, headers, rows_data, col_widths)

    # Ngoại lệ
    p_nl = doc.add_paragraph()
    p_nl.paragraph_format.space_before = Pt(4)
    p_nl.paragraph_format.space_after = Pt(2)
    r_nl = p_nl.add_run("Ngoại lệ:")
    r_nl.font.name = 'Times New Roman'
    r_nl.font.size = Pt(11)
    r_nl.font.bold = True
    r_nl.font.color.rgb = RGBColor(0, 0, 0)

    for nl in uc_data['ngoai_le']:
        p_nl_item = doc.add_paragraph()
        p_nl_item.paragraph_format.space_before = Pt(2)
        p_nl_item.paragraph_format.space_after = Pt(2)
        p_nl_item.paragraph_format.line_spacing = 1.15
        p_nl_item.paragraph_format.left_indent = Inches(0.2)
        r_nl_item = p_nl_item.add_run(nl)
        r_nl_item.font.name = 'Times New Roman'
        r_nl_item.font.size = Pt(11)
        r_nl_item.font.color.rgb = RGBColor(0, 0, 0)

    # Divider line
    p_div = doc.add_paragraph()
    p_div.paragraph_format.space_before = Pt(6)
    p_div.paragraph_format.space_after = Pt(6)
    r_div = p_div.add_run("─" * 60)
    r_div.font.name = 'Times New Roman'
    r_div.font.size = Pt(9)
    r_div.font.color.rgb = RGBColor(160, 160, 160)

print("Helper functions defined.")
