# -*- coding: utf-8 -*-
"""
Master script to generate:
1. Tai_lieu_Dac_ta_Use_Case_He_thong_Quan_ly_Nha_tro.docx (Complete Word document)
2. nghiệp vụ mẫu.txt (Full text document for easy viewing in text editor)

Fully compliant with:
- The exact template provided by the user
- Information in E:\Đồ án tốt nghiệp\Doc\Mô tả.txt
- Style requirements: strictly black text on white background, bold/normal headers, no colors or flashy styling.
"""

import os
import sys

if sys.stdout.encoding != 'utf-8':
    try:
        sys.stdout.reconfigure(encoding='utf-8')
    except Exception:
        pass

import docx
from docx.shared import Inches, Pt, RGBColor
from docx.enum.text import WD_ALIGN_PARAGRAPH
from docx.enum.table import WD_TABLE_ALIGNMENT
from docx.oxml import OxmlElement, parse_xml
from docx.oxml.ns import qn, nsdecls

from data_landlord import USECASES_LANDLORD
from data_tenant import USECASES_TENANT
from data_admin import USECASES_ADMIN

DOC_DIR = r"E:\Đồ án tốt nghiệp\Doc"
OUTPUT_DOCX = os.path.join(DOC_DIR, "Tai_lieu_Dac_ta_Use_Case_He_thong_Quan_ly_Nha_tro.docx")
OUTPUT_TXT = os.path.join(DOC_DIR, "nghiệp vụ mẫu.txt")

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
        set_cell_margins(hdr_cells[i], top=120, bottom=120, left=130, right=130)
        p = hdr_cells[i].paragraphs[0]
        p.alignment = WD_ALIGN_PARAGRAPH.CENTER
        p.paragraph_format.space_before = Pt(2)
        p.paragraph_format.space_after = Pt(2)
        for r in p.runs:
            r.font.name = 'Times New Roman'
            r.font.size = Pt(10)
            r.font.bold = True
            r.font.color.rgb = RGBColor(0, 0, 0)
        shd = parse_xml(f'<w:shd {nsdecls("w")} w:fill="FFFFFF"/>')
        hdr_cells[i]._tc.get_or_add_tcPr().append(shd)

    # Format data rows
    for r_idx, row_values in enumerate(rows_data):
        row_cells = table.rows[r_idx + 1].cells
        for c_idx, val in enumerate(row_values):
            row_cells[c_idx].text = str(val)
            set_cell_margins(row_cells[c_idx], top=80, bottom=80, left=110, right=110)
            p = row_cells[c_idx].paragraphs[0]
            p.paragraph_format.space_before = Pt(2)
            p.paragraph_format.space_after = Pt(2)
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

    if col_widths:
        for row in table.rows:
            for i, w in enumerate(col_widths):
                row.cells[i].width = Inches(w)

    p_after = doc.add_paragraph()
    p_after.paragraph_format.space_before = Pt(2)
    p_after.paragraph_format.space_after = Pt(3)

def add_usecase_to_doc(doc, uc_data):
    # Sub-heading
    h = doc.add_heading(level=2)
    h.paragraph_format.space_before = Pt(14)
    h.paragraph_format.space_after = Pt(4)
    run_h = h.add_run(f"Use Case {uc_data['stt']}: {uc_data['use_case']}")
    run_h.font.name = 'Times New Roman'
    run_h.font.size = Pt(12.5)
    run_h.font.bold = True
    run_h.font.color.rgb = RGBColor(0, 0, 0)

    # Metadata matching template
    fields = [
        ("Chức năng:", uc_data['chuc_nang']),
        ("Use case:", uc_data['use_case']),
        ("Actor:", uc_data['actor']),
        ("Tiền điều kiện:", uc_data['tien_dieu_kien']),
        ("Hậu điều kiện:", uc_data['hau_dieu_kien']),
    ]

    for label, val in fields:
        p = doc.add_paragraph()
        p.paragraph_format.space_before = Pt(1.5)
        p.paragraph_format.space_after = Pt(1.5)
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
            p_step.paragraph_format.space_before = Pt(1.5)
            p_step.paragraph_format.space_after = Pt(1.5)
            p_step.paragraph_format.line_spacing = 1.15
            p_step.paragraph_format.left_indent = Inches(0.2)
            r_step = p_step.add_run(item[1])
            r_step.font.name = 'Times New Roman'
            r_step.font.size = Pt(10.5)
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
        p_nl_item.paragraph_format.space_before = Pt(1.5)
        p_nl_item.paragraph_format.space_after = Pt(1.5)
        p_nl_item.paragraph_format.line_spacing = 1.15
        p_nl_item.paragraph_format.left_indent = Inches(0.2)
        r_nl_item = p_nl_item.add_run(nl)
        r_nl_item.font.name = 'Times New Roman'
        r_nl_item.font.size = Pt(10.5)
        r_nl_item.font.color.rgb = RGBColor(0, 0, 0)

    # Horizontal separator
    p_sep = doc.add_paragraph()
    p_sep.paragraph_format.space_before = Pt(6)
    p_sep.paragraph_format.space_after = Pt(6)
    r_sep = p_sep.add_run("─" * 60)
    r_sep.font.name = 'Times New Roman'
    r_sep.font.size = Pt(8)
    r_sep.font.color.rgb = RGBColor(180, 180, 180)

def generate_text_representation(all_usecases):
    """Generate clean text version matching the exact template."""
    lines = []
    lines.append("================================================================================")
    lines.append("HỆ THỐNG QUẢN LÝ NHÀ TRỌ HỖ TRỢ GHÉP NGƯỜI Ở CHUNG")
    lines.append("TÀI LIỆU ĐẶC TẢ CHI TIẾT USE CASE CỦA TỪNG ROLE THEO CHUẨN TEMPLATE")
    lines.append("================================================================================\n")

    current_role = None
    for uc in all_usecases:
        if uc['role'] != current_role:
            current_role = uc['role']
            lines.append(f"\n################################################################################")
            lines.append(f"PHẦN: ĐẶC TẢ USE CASE DÀNH CHO ROLE: {current_role.upper()}")
            lines.append(f"################################################################################\n")

        lines.append(f"Chức năng: {uc['chuc_nang']}")
        lines.append(f"Use case: {uc['use_case']}")
        lines.append(f"Actor: {uc['actor']}")
        lines.append(f"Tiền điều kiện: {uc['tien_dieu_kien']}")
        lines.append(f"Hậu điều kiện: {uc['hau_dieu_kien']}")
        lines.append("Kịch bản chính:")
        for item in uc['kich_ban_chinh']:
            if item[0] == "text":
                lines.append(f"  {item[1]}")
            elif item[0] == "table":
                headers = item[1]
                rows = item[2]
                lines.append("  " + " | ".join(headers))
                lines.append("  " + " | ".join(["---"] * len(headers)))
                for r in rows:
                    lines.append("  " + " | ".join(r))
        lines.append("Ngoại lệ:")
        for nl in uc['ngoai_le']:
            lines.append(f"  {nl}")
        lines.append("\n" + "-" * 80 + "\n")

    return "\n".join(lines)

def build_document():
    all_usecases = USECASES_LANDLORD + USECASES_TENANT + USECASES_ADMIN
    print(f"Total use cases to generate: {len(all_usecases)}")

    # 1. Create Word Document
    doc = docx.Document()

    # Set page margins
    sections = doc.sections
    for s in sections:
        s.top_margin = Inches(0.8)
        s.bottom_margin = Inches(0.8)
        s.left_margin = Inches(1.0)
        s.right_margin = Inches(0.8)

    # Document Header Title
    p_title = doc.add_paragraph()
    p_title.paragraph_format.space_before = Pt(0)
    p_title.paragraph_format.space_after = Pt(4)
    p_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_title_uni = p_title.add_run("BỘ GIÁO DỤC VÀ ĐÀO TẠO\nTRƯỜNG ĐẠI HỌC BÁCH KHOA HÀ NỘI\n")
    r_title_uni.font.name = 'Times New Roman'
    r_title_uni.font.size = Pt(11)
    r_title_uni.font.bold = True
    r_title_uni.font.color.rgb = RGBColor(0, 0, 0)

    p_main_title = doc.add_paragraph()
    p_main_title.paragraph_format.space_before = Pt(12)
    p_main_title.paragraph_format.space_after = Pt(6)
    p_main_title.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_mt = p_main_title.add_run("TÀI LIỆU ĐẶC TẢ USE CASE CHI TIẾT\nHỆ THỐNG QUẢN LÝ NHÀ TRỌ HỖ TRỢ GHÉP NGƯỜI Ở CHUNG")
    r_mt.font.name = 'Times New Roman'
    r_mt.font.size = Pt(15)
    r_mt.font.bold = True
    r_mt.font.color.rgb = RGBColor(0, 0, 0)

    p_sub = doc.add_paragraph()
    p_sub.paragraph_format.space_before = Pt(2)
    p_sub.paragraph_format.space_after = Pt(16)
    p_sub.alignment = WD_ALIGN_PARAGRAPH.CENTER
    r_sub = p_sub.add_run("(Tài liệu đặc tả nghiệp vụ chi tiết từng bước theo chuẩn kịch bản Use Case)")
    r_sub.font.name = 'Times New Roman'
    r_sub.font.size = Pt(11)
    r_sub.font.italic = True
    r_sub.font.color.rgb = RGBColor(0, 0, 0)

    # -------------------------------------------------------------------------
    # PHẦN 1: GIỚI THIỆU TỔNG QUAN & DANH SÁCH TÁC NHÂN
    # -------------------------------------------------------------------------
    h1 = doc.add_heading(level=1)
    h1.paragraph_format.space_before = Pt(16)
    h1.paragraph_format.space_after = Pt(6)
    r_h1 = h1.add_run("PHẦN 1: GIỚI THIỆU TỔNG QUAN & DANH MỤC CÁC TÁC NHÂN")
    r_h1.font.name = 'Times New Roman'
    r_h1.font.size = Pt(13.5)
    r_h1.font.bold = True
    r_h1.font.color.rgb = RGBColor(0, 0, 0)

    p_intro = doc.add_paragraph()
    p_intro.paragraph_format.space_before = Pt(3)
    p_intro.paragraph_format.space_after = Pt(6)
    p_intro.paragraph_format.line_spacing = 1.2
    r_intro = p_intro.add_run(
        "Hệ thống 'Quản lý nhà trọ hỗ trợ ghép người ở chung' được xây dựng nhằm giải quyết đồng thời hai bài toán cấp thiết: "
        "(1) Cung cấp công cụ quản lý chuyên nghiệp, tinh gọn và minh bạch cho Chủ trọ (quản lý tòa nhà, phòng trọ, dịch vụ, "
        "hợp đồng, tính tiền điện nước tự động, quản lý hóa đơn và giải quyết khiếu nại); và (2) Cung cấp nền tảng kết nối thông minh "
        "dành cho Người thuê trọ, đặc biệt là tính năng đột phá hỗ trợ ghép người ở chung dựa trên bản đồ vị trí, bán kính tìm kiếm "
        "và thuật toán so khớp mức độ tương thích lối sống (giờ giấc, thói quen sinh hoạt, thú cưng, hút thuốc, nấu ăn). "
        "Hệ thống hỗ trợ cả đối tượng người đã có phòng trọ thực tế (hoặc phòng ảo) và đối tượng chưa có phòng đang tìm bạn lập nhóm."
    )
    r_intro.font.name = 'Times New Roman'
    r_intro.font.size = Pt(11)
    r_intro.font.color.rgb = RGBColor(0, 0, 0)

    p_act_lbl = doc.add_paragraph()
    p_act_lbl.paragraph_format.space_before = Pt(6)
    p_act_lbl.paragraph_format.space_after = Pt(3)
    r_act_lbl = p_act_lbl.add_run("Bảng 1.1: Danh mục các tác nhân (Actors) trong hệ thống")
    r_act_lbl.font.name = 'Times New Roman'
    r_act_lbl.font.size = Pt(10.5)
    r_act_lbl.font.bold = True
    r_act_lbl.font.color.rgb = RGBColor(0, 0, 0)

    actor_table_headers = ["STT", "Tác nhân (Actor)", "Mô tả vai trò và trách nhiệm"]
    actor_table_rows = [
        ["1", "Chủ trọ (Landlord)", "Người sở hữu hoặc quản lý tòa nhà, phòng trọ; quản lý hợp đồng, khách thuê, chốt điện nước, thu tiền hóa đơn và xử lý khiếu nại."],
        ["2", "Người thuê (Tenant)", "Người đang thuê phòng trọ hoặc người có nhu cầu tìm bạn ở ghép; đăng tin ghép phòng, xin gia nhập nhóm, duyệt thành viên, xem hóa đơn và gửi phản ánh."],
        ["3", "Quản trị viên (Admin)", "Người vận hành toàn bộ hệ thống; quản lý tài khoản người dùng, phê duyệt khiếu nại tranh chấp toàn sàn, kiểm duyệt nội dung và cấu hình Master Data."],
        ["4", "Khách vãng lai (Guest)", "Người dùng chưa đăng nhập; có quyền tìm kiếm thông tin phòng trọ, bài đăng ghép phòng và xem vị trí trên bản đồ."]
    ]
    add_table_to_doc(doc, actor_table_headers, actor_table_rows, [0.6, 2.0, 4.4])

    p_summary_lbl = doc.add_paragraph()
    p_summary_lbl.paragraph_format.space_before = Pt(8)
    p_summary_lbl.paragraph_format.space_after = Pt(3)
    r_sum_lbl = p_summary_lbl.add_run("Bảng 1.2: Tổng hợp danh mục 22 Use Case theo từng Role")
    r_sum_lbl.font.name = 'Times New Roman'
    r_sum_lbl.font.size = Pt(10.5)
    r_sum_lbl.font.bold = True
    r_sum_lbl.font.color.rgb = RGBColor(0, 0, 0)

    sum_headers = ["STT", "Mã UC", "Tên Use Case", "Chức năng", "Role phụ trách"]
    sum_rows = [
        # Landlord
        ["1", "UC-LL-01", "Quản lý tòa nhà (CRUD Tòa nhà)", "Quản lý tòa nhà", "Chủ trọ"],
        ["2", "UC-LL-02", "Quản lý phòng trọ (CRUD Phòng)", "Quản lý phòng trọ", "Chủ trọ"],
        ["3", "UC-LL-03", "Cấu hình dịch vụ tiện ích", "Quản lý dịch vụ tiện ích", "Chủ trọ"],
        ["4", "UC-LL-04", "Quản lý khách thuê & Mời liên kết tài khoản", "CRUD Khách thuê & Liên kết", "Chủ trọ"],
        ["5", "UC-LL-05", "Tạo hợp đồng thuê phòng", "Tạo hợp đồng thuê phòng", "Chủ trọ"],
        ["6", "UC-LL-06", "Ghi chỉ số & Lập hóa đơn hàng tháng", "Tính tiền phòng theo tháng", "Chủ trọ"],
        ["7", "UC-LL-07", "Xác nhận thanh toán hóa đơn", "CRUD Hóa đơn tháng", "Chủ trọ"],
        ["8", "UC-LL-08", "Tiếp nhận và xử lý khiếu nại của khách thuê", "Xử lý khiếu nại", "Chủ trọ"],
        ["9", "UC-LL-09", "Xử lý trả phòng và thanh lý hợp đồng", "Xử lý trả phòng", "Chủ trọ"],
        ["10", "UC-LL-10", "Xem Dashboard & Báo cáo thống kê chủ trọ", "Dashboard chủ trọ", "Chủ trọ"],
        # Tenant
        ["11", "UC-TN-01", "Tìm kiếm phòng trọ & bài đăng ở ghép", "Tìm kiếm", "Người thuê"],
        ["12", "UC-TN-02", "Đăng bài tìm người ở ghép - Có phòng trọ", "Đăng bài (Có phòng)", "Người thuê"],
        ["13", "UC-TN-03", "Đăng bài tìm người ở ghép - Chưa có phòng", "Đăng bài (Chưa có phòng)", "Người thuê"],
        ["14", "UC-TN-04", "Xin gia nhập nhóm ở ghép", "Xin gia nhập nhóm", "Người thuê"],
        ["15", "UC-TN-05", "Duyệt thành viên nhóm ở ghép", "Duyệt thành viên nhóm", "Người thuê"],
        ["16", "UC-TN-06", "Tiếp nhận & Xác nhận liên kết phòng trọ", "Liên kết phòng trọ", "Người thuê"],
        ["17", "UC-TN-07", "Xem lịch sử thuê phòng và hóa đơn", "Xem lịch sử thuê phòng", "Người thuê"],
        ["18", "UC-TN-08", "Gửi khiếu nại / Báo cáo sự cố phòng trọ", "Khiếu nại", "Người thuê"],
        # Admin
        ["19", "UC-AD-01", "Quản lý người dùng hệ thống (CRUD User)", "CRUD Người dùng", "Admin"],
        ["20", "UC-AD-02", "Duyệt và xử lý khiếu nại toàn hệ thống", "Duyệt khiếu nại hệ thống", "Admin"],
        ["21", "UC-AD-03", "Quản lý dữ liệu dùng chung (Master Data)", "Quản lý Master Data", "Admin"],
        ["22", "UC-AD-04", "Xem Dashboard quản trị toàn hệ thống", "Dashboard hệ thống", "Admin"]
    ]
    add_table_to_doc(doc, sum_headers, sum_rows, [0.6, 1.0, 2.7, 1.7, 1.0])

    # -------------------------------------------------------------------------
    # PHẦN 2: ĐẶC TẢ CHI TIẾT CÁC USE CASE - ROLE: CHỦ TRỌ
    # -------------------------------------------------------------------------
    h2 = doc.add_heading(level=1)
    h2.paragraph_format.space_before = Pt(18)
    h2.paragraph_format.space_after = Pt(8)
    r_h2 = h2.add_run("PHẦN 2: ĐẶC TẢ CHI TIẾT CÁC USE CASE - ROLE: CHỦ TRỌ (LANDLORD)")
    r_h2.font.name = 'Times New Roman'
    r_h2.font.size = Pt(13.5)
    r_h2.font.bold = True
    r_h2.font.color.rgb = RGBColor(0, 0, 0)

    for uc in USECASES_LANDLORD:
        add_usecase_to_doc(doc, uc)

    # -------------------------------------------------------------
    # PHẦN 3: ĐẶC TẢ CHI TIẾT CÁC USE CASE - ROLE: NGƯỜI THUÊ
    # -------------------------------------------------------------
    h3 = doc.add_heading(level=1)
    h3.paragraph_format.space_before = Pt(18)
    h3.paragraph_format.space_after = Pt(8)
    r_h3 = h3.add_run("PHẦN 3: ĐẶC TẢ CHI TIẾT CÁC USE CASE - ROLE: NGƯỜI THUÊ (TENANT)")
    r_h3.font.name = 'Times New Roman'
    r_h3.font.size = Pt(13.5)
    r_h3.font.bold = True
    r_h3.font.color.rgb = RGBColor(0, 0, 0)

    for uc in USECASES_TENANT:
        add_usecase_to_doc(doc, uc)

    # -------------------------------------------------------------
    # PHẦN 4: ĐẶC TẢ CHI TIẾT CÁC USE CASE - ROLE: QUẢN TRỊ VIÊN
    # -------------------------------------------------------------
    h4 = doc.add_heading(level=1)
    h4.paragraph_format.space_before = Pt(18)
    h4.paragraph_format.space_after = Pt(8)
    r_h4 = h4.add_run("PHẦN 4: ĐẶC TẢ CHI TIẾT CÁC USE CASE - ROLE: QUẢN TRỊ VIÊN (ADMIN)")
    r_h4.font.name = 'Times New Roman'
    r_h4.font.size = Pt(13.5)
    r_h4.font.bold = True
    r_h4.font.color.rgb = RGBColor(0, 0, 0)

    for uc in USECASES_ADMIN:
        add_usecase_to_doc(doc, uc)

    # Save Word Document
    doc.save(OUTPUT_DOCX)
    print(f"Successfully generated Word docx at: {OUTPUT_DOCX}")
    print(f"File size: {os.path.getsize(OUTPUT_DOCX)} bytes")

    # 2. Write full text to nghiệp vụ mẫu.txt
    text_content = generate_text_representation(all_usecases)
    with open(OUTPUT_TXT, "w", encoding="utf-8") as f:
        f.write(text_content)
    print(f"Successfully updated text version at: {OUTPUT_TXT}")
    print(f"Text file size: {os.path.getsize(OUTPUT_TXT)} bytes")

if __name__ == "__main__":
    build_document()
