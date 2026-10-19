#!/usr/bin/env python3
"""
generate_resume.py
Generates Ayush Singh's 1-page resume PDF with pixel-perfect precision matching
original formatting, typography, margins, rules, and bullet styling.
"""

import os
import shutil
import fitz

def generate_resume(output_pdf_path, preview_png_path=None):
    page_w = 595.2755737304688
    page_h = 841.8897705078125

    font_reg_path = '/System/Library/Fonts/Supplemental/Times New Roman.ttf'
    font_bold_path = '/System/Library/Fonts/Supplemental/Times New Roman Bold.ttf'
    font_italic_path = '/System/Library/Fonts/Supplemental/Times New Roman Italic.ttf'

    doc = fitz.open()
    page = doc.new_page(width=page_w, height=page_h)

    page.insert_font(fontname='Times-Roman', fontfile=font_reg_path)
    page.insert_font(fontname='Times-Bold', fontfile=font_bold_path)
    page.insert_font(fontname='Times-Italic', fontfile=font_italic_path)

    font_reg = fitz.Font(fontfile=font_reg_path)
    font_bold = fitz.Font(fontfile=font_bold_path)
    font_italic = fitz.Font(fontfile=font_italic_path)

    line_h = 10.05
    item_gap = 10.4
    sec_gap = 12.0
    post_line_gap = 12.5  # Increased gap underneath the line divider for each section

    y = 28.5

    # 1. Header Name
    name = 'AYUSH SINGH'
    name_w = font_reg.text_length(name, 17.2)
    name_x = (page_w - name_w) / 2
    page.insert_text(fitz.Point(name_x, y), name, fontname='Times-Roman', fontsize=17.2)

    # 2. Contact Line 1
    y += 14.5
    c1 = 'Singapore | ayushsinghsolanki06@gmail.com | +65 94512947'
    c1_w = font_reg.text_length(c1, 10.35)
    c1_x = (page_w - c1_w) / 2
    page.insert_text(fitz.Point(c1_x, y), c1, fontname='Times-Roman', fontsize=10.35)

    # 3. Contact Line 2
    y += 13.5
    c2 = 'linkedin.com/in/ayush-singh0606 | github.com/Legend8068 | website-portfolio-vert-kappa.vercel.app'
    c2_w = font_reg.text_length(c2, 10.35)
    c2_x = (page_w - c2_w) / 2
    page.insert_text(fitz.Point(c2_x, y), c2, fontname='Times-Roman', fontsize=10.35)

    def draw_date(date_str, cur_y):
        if ' – ' in date_str:
            p1, p2 = date_str.split(' – ')
            w1 = font_reg.text_length(p1 + ' ', 9.0)
            dash_w = 4.2
            w2 = font_reg.text_length(' ' + p2, 9.0)
            total_w = w1 + dash_w + w2
            start_x = 561.28 - total_w
            page.insert_text(fitz.Point(start_x, cur_y), p1, fontname='Times-Roman', fontsize=9.0)
            dash_x = start_x + w1
            page.draw_line(fitz.Point(dash_x, cur_y - 2.8), fitz.Point(dash_x + dash_w, cur_y - 2.8), color=(0, 0, 0), width=0.55)
            page.insert_text(fitz.Point(dash_x + dash_w + font_reg.text_length(' ', 9.0), cur_y), p2, fontname='Times-Roman', fontsize=9.0)
        else:
            w = font_reg.text_length(date_str, 9.0)
            page.insert_text(fitz.Point(561.28 - w, cur_y), date_str, fontname='Times-Roman', fontsize=9.0)

    sections = [
        ('EDUCATION', [
            {
                'title': 'Singapore University of Technology and Design, Singapore',
                'date': '2024 – 2028',
                'subtitle': 'BEng, Computer Science and Design',
                'bullets': [
                    'Minor in Design and Artificial Intelligence, along with the Computer Science and Design major',
                    'Coursework in software development, AI/ML fundamentals, systems thinking and design'
                ]
            },
            {
                'title': 'NPS International School, Singapore',
                'date': '2020 – 2024',
                'subtitle': 'IB Diploma and IGCSE',
                'bullets': [
                    'Completed internationally recognised curricula, IB Diploma and IGCSE',
                    'Certificate of Academic Excellence and International Certificate of Education (Distinction)'
                ]
            }
        ]),
        ('EXPERIENCE', [
            {
                'title_parts': [('Accenture', 'Times-Bold'), (', Singapore', 'Times-Roman')],
                'date': 'Sep 2026 – Present',
                'subtitle': 'Cloud Application and Data Engineering Intern',
                'bullets': [
                    ['Engineered serverless REST APIs and web backends on AWS (Lambda, API Gateway, DynamoDB), achieving reliable, low latency',
                     'request handling through structured status handlers, CORS rules, and CloudWatch tracking.'],
                    ['Built automated data export pipelines bypassing API Gateway 6 MB payload limits for high volume datasets and strengthened API',
                     'security and access governance, preventing unauthorized requests across user tiers and added role based access control via Microsoft',
                     'Entra ID, Cognito, and JWT Authorizers.'],
                    ['Enhanced server reliability and access across AWS infrastructure, ensuring continuous service uptime by deploying automated',
                     'maintenance scripts.'],
                    ['Administered enterprise Privileged Access Management (PAM) via CyberArk, ensuring zero credential exposure and strict access',
                     'compliance by onboarding, editing, configuring, and troubleshooting privileged accounts and permissions.']
                ]
            },
            {
                'title_parts': [('MathVision', 'Times-Bold'), (', Singapore', 'Times-Roman')],
                'date': 'Jan 2025 – Aug 2026',
                'subtitle': 'Part-Time Tutor',
                'bullets': [
                    'Tutor physics and mathematics one on one and in small groups for IGCSE and higher secondary students',
                    'Rebuild core concepts, sharpen problem solving and prepare students for international exams'
                ]
            },
            {
                'title_parts': [('Student Government (ROOT)', 'Times-Bold'), (', SUTD', 'Times-Roman')],
                'date': 'Feb 2025 – Feb 2026',
                'subtitle': 'Events and Welfare Director',
                'bullets': [
                    'Planned and ran welfare events ranging from treasure hunts to the SUTD Student Organisation Showcase',
                    'Coordinated logistics, budgets and volunteers across multiple teams throughout the academic year'
                ]
            },
            {
                'title_parts': [('Tchoukball Club', 'Times-Bold'), (', SUTD', 'Times-Roman')],
                'date': 'Feb 2025 – Feb 2026',
                'subtitle': 'Treasurer',
                'bullets': [
                    'Managed club finances and budgeting, and helped plan training sessions and welfare activities for members throughout the year'
                ]
            }
        ]),
        ('PROJECTS AND LEADERSHIP', [
            {
                'title': 'World Cup Tracker',
                'date': '2026',
                'bullets': [
                    'Built a live match tracker for the 2026 FIFA World Cup using React and JavaScript, pulling real time scores, standings and fixtures',
                    'Designed the interface to refresh data in place so users follow matches without a page reload'
                ]
            },
            {
                'title': 'SG MeetHalfway',
                'date': '2026',
                'bullets': [
                    "Built a web app in React and Python that finds a fair meeting spot for a group using everyone's location and public transit data",
                    'Weighted results by travel time rather than distance so the venue is equal effort for each person'
                ]
            },
            {
                'title': 'MakanMates',
                'date': '2026',
                'bullets': [
                    "Built an Android app that recommends fair food locations for a group of friends using everyone's location and public transit data",
                    'Ranked nearby restaurants by combined travel time for the group, helping friends settle on a spot without lengthy back and forth'
                ]
            },
            {
                'title': 'Telegram Task Bot',
                'date': '2026',
                'bullets': [
                    'Building a Python based Telegram bot that tracks tasks and deadlines and sends reminders directly in chat',
                    'Cutting the friction of switching between a task app and the chats where work actually gets assigned'
                ]
            },
            {
                'title': 'Maritime Analytics Dashboard, Maritime Hackathon, NUS',
                'date': '2025',
                'bullets': [
                    'Built a dashboard surfacing key operating statistics for maritime companies, turning raw data into views a team could act on'
                ]
            },
            {
                'title': 'Project Ancora, with Youth for Causes',
                'date': '2024',
                'subtitle': 'Head',
                'bullets': [
                    'Served as Head of Project Ancora, a student initiative in partnership with Youth for Causes to protect and care for stray animals'
                ]
            },
            {
                'title': 'Physics Society',
                'date': '2024',
                'subtitle': 'Organising Committee',
                'bullets': [
                    'Served on the Organising Committee, running events, a podcast and newsletters to make physics ideas more approachable to peers'
                ]
            },
            {
                'title': 'Crackerjack Convention',
                'date': '2024',
                'subtitle': 'Workshop Facilitator',
                'bullets': [
                    'Served as Workshop Facilitator at Crackerjack Convention, an annual event helping young people build 21st century skills'
                ]
            }
        ]),
        ('AWARDS AND PROGRAMMES', [
            {
                'title': 'CatalystX Entrepreneurship Startathon, NTU',
                'date': '2025',
                'subtitle': 'Most Creative Idea, $200',
                'bullets': [
                    "Pitched a startup concept for making biofuels part of everyday life at NTU's entrepreneurship startathon"
                ]
            },
            {
                'title': 'Innovation and Entrepreneurship Programme, VinUni × SUTD',
                'date': '2025',
                'subtitle': 'Best Idea, Runner-Up',
                'bullets': [
                    'Designed and prototyped a trade compliance and assessment interface during a short exchange programme in Hanoi, Vietnam'
                ]
            },
            {
                'title': 'STEM Exhibition',
                'date': '2024',
                'subtitle': 'Best Exhibit, Physics',
                'bullets': [
                    'Won Best Exhibit in the Physics category for a Mars themed project at the STEM Exhibition'
                ]
            }
        ])
    ]

    skills = [
        'Languages: Python, JavaScript, TypeScript, Java, C, C++, HTML, CSS',
        'Frameworks and Libraries: React, Node.js, Express.js, Next.js, TensorFlow, NumPy, Pandas, Matplotlib, OpenCV',
        'Tools and Platforms: AWS (Lambda, EC2, DynamoDB, S3), CyberArk, Postman, Git and GitHub, Firebase, Google Cloud, MySQL, Figma',
        'Areas of Interest: AI/ML fundamentals, web app development, scripting and automation pipelines, bot development, UI design'
    ]

    for sec_title, items in sections:
        y += sec_gap
        # Header text
        page.insert_text(fitz.Point(40.0, y), sec_title, fontname='Times-Roman', fontsize=9.45)
        # Line under header
        line_y = y + 3.7
        page.draw_line(fitz.Point(40.0, line_y), fitz.Point(555.28, line_y), color=(0, 0, 0), width=0.75)
        # Increased gap underneath the line divider
        y = line_y + post_line_gap

        for i, item in enumerate(items):
            if i > 0:
                y += item_gap

            # Title
            if 'title_parts' in item:
                cur_x = 34.0
                for part_text, part_font in item['title_parts']:
                    page.insert_text(fitz.Point(cur_x, y), part_text, fontname=part_font, fontsize=9.0)
                    cur_f = font_bold if part_font == 'Times-Bold' else font_reg
                    cur_x += cur_f.text_length(part_text, 9.0)
            else:
                page.insert_text(fitz.Point(34.0, y), item['title'], fontname='Times-Bold', fontsize=9.0)

            # Date
            draw_date(item['date'], y)

            # Subtitle if present
            if 'subtitle' in item:
                y += line_h
                sub = item['subtitle']
                page.insert_text(fitz.Point(40.0, y), sub, fontname='Times-Italic', fontsize=9.0)
                sub_w = font_italic.text_length(sub, 9.0)
                page.draw_line(fitz.Point(40.0, y + 1.0), fitz.Point(40.0 + sub_w, y + 1.0), color=(0, 0, 0), width=0.42)

            # Bullets
            for b in item['bullets']:
                y += line_h
                # Crisp circular bullet
                page.draw_circle(fitz.Point(41.6, y - 2.8), 1.25, fill=(0, 0, 0), color=(0, 0, 0))
                if isinstance(b, list):
                    page.insert_text(fitz.Point(55.0, y), b[0], fontname='Times-Roman', fontsize=9.0)
                    for l in b[1:]:
                        y += line_h
                        page.insert_text(fitz.Point(55.0, y), l, fontname='Times-Roman', fontsize=9.0)
                else:
                    page.insert_text(fitz.Point(55.0, y), b, fontname='Times-Roman', fontsize=9.0)

    # SKILLS AND PERSONAL
    y += sec_gap
    page.insert_text(fitz.Point(40.0, y), 'SKILLS AND PERSONAL', fontname='Times-Roman', fontsize=9.45)
    line_y = y + 3.7
    page.draw_line(fitz.Point(40.0, line_y), fitz.Point(555.28, line_y), color=(0, 0, 0), width=0.75)
    # Increased gap underneath the line divider
    y = line_y + post_line_gap

    for s in skills:
        page.insert_text(fitz.Point(40.0, y), s, fontname='Times-Roman', fontsize=9.0)
        y += line_h

    final_text_y = y - line_h
    print(f'Done! Final text baseline: {final_text_y:.2f} pt. Bottom margin: {page_h - final_text_y:.2f} pt')
    
    # Set PDF metadata
    doc.set_metadata({
        'title': 'Ayush Singh Resume',
        'author': 'Ayush Singh',
        'creator': 'Ayush Singh',
        'producer': 'ReportLab / PyMuPDF',
    })

    doc.save(output_pdf_path)

    if preview_png_path:
        doc2 = fitz.open(output_pdf_path)
        doc2[0].get_pixmap(dpi=150).save(preview_png_path)
        print(f'Saved preview image to {preview_png_path}')

if __name__ == '__main__':
    targets = [
        'output/pdf/Ayush-Singh-Resume.pdf',
        'public/Ayush-Singh-Resume.pdf',
        'dist/Ayush-Singh-Resume.pdf',
        'my-portfolio/public/Ayush Singh Resume.pdf'
    ]
    
    # Generate main PDF
    primary_target = 'public/Ayush-Singh-Resume.pdf'
    generate_resume(primary_target, 'resume_preview.png')
    
    for t in targets:
        if t != primary_target:
            os.makedirs(os.path.dirname(t), exist_ok=True)
            shutil.copyfile(primary_target, t)
            print(f'Copied to {t}')
