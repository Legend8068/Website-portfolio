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
                    'Coursework in data structures and algorithms, software development, machine learning and computer systems'
                ]
            },
            {
                'title': 'NPS International School, Singapore',
                'date': '2020 – 2024',
                'subtitle': 'IB Diploma and IGCSE',
                'bullets': [
                    'Certificate of Academic Excellence and International Certificate of Education (Distinction)'
                ]
            }
        ]),
        ('EXPERIENCE', [
            {
                'title_parts': [('Accenture', 'Times-Bold'), (', Singapore', 'Times-Roman')],
                'date': 'Sep 2026 – Present',
                'subtitle': 'Cloud Application Engineer Intern',
                'bullets': [
                    ['Helped migrate an internal geospatial data platform onto commercial AWS, covering around 35 dataset types across its upload,',
                     'validation and versioning flow, by writing Python Lambda functions and wiring up the API Gateway routes, S3 triggers,',
                     'DynamoDB tables and SNS topics defined in its SAM templates.'],
                    ['Cut the wait to test a backend change from a cloud deployment to a few seconds by building a local stand-in that runs all 10 production',
                     'Lambda functions unchanged against fakes for S3, DynamoDB and SNS, with a 66 step run compared against saved output so the team',
                     'could see what a change had broken before it went out.'],
                    ["Traced 5 defects in code that was already live, including a deployment template pointing at the wrong handler and two frontend calls",
                     "to API routes that do not exist, by reading the inherited backend function by function and writing the team's reference notes on it."],
                    ['Kept exports of large datasets working past the 6 MB API Gateway response limit and restricted API access by role using Microsoft',
                     'Entra ID, Cognito and JWT authorizers, with CloudWatch logs to trace requests that failed part way through.']
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
                'title': 'Detecting AI Generated Text, 50.007 Machine Learning',
                'date': '2026',
                'bullets': [
                    ['Raised Macro-F1 from 0.66 to 0.80 on the class Kaggle leaderboard by writing logistic regression, PCA and KNN from scratch in Python,',
                     'with no deep learning and no pretrained models'],
                    ['Caught that accuracy was scoring a useless model well, because the corpus ran 62.5% machine written and always guessing machine',
                     'scored 62.5% while finding no human text at all, so we moved our scoring onto Macro-F1 and judged every later change on both classes'],
                    ['Closed a gap between local scores and leaderboard scores by scoring writing style rather than topic, and by building a validation split',
                     'that matched how the graded test set was sampled']
                ]
            },
            {
                'title': 'SG MeetHalfway',
                'date': '2026',
                'bullets': [
                    'Cut the worst commute in a group meet up by picking the venue on real transit time rather than distance on a map',
                    'Weighted every leg with routing API times in a React and Python web app, then searched for the point with the smallest worst case trip'
                ]
            },
            {
                'title': 'World Cup Tracker',
                'date': '2026',
                'bullets': [
                    'Pulled scores, standings and fixtures for the 2026 World Cup into one live view, built in React and JavaScript',
                    'Reconciled three feeds that disagree during a match into a single state, so the page updates in place and never contradicts itself'
                ]
            },
            {
                'title': 'MakanMates',
                'date': '2026',
                'bullets': [
                    "Ranked food spots by the group's combined transit time so no one travels twice as far as everyone else, as a native Android app",
                    'Wrote it in Java with Firebase for sign in and shared state, caching lookups so a recommendation is ready without a connection'
                ]
            },
            {
                'title': 'Telegram Task Bot',
                'date': '2026',
                'bullets': [
                    "Turning free text messages such as 'next fri' and 'EOD' into scheduled reminders inside the chat where the task was assigned",
                    'Writing it in Python against a SQLite job queue so reminders survive restarts and time zone changes'
                ]
            },
            {
                'title': 'Maritime Analytics Dashboard, Maritime Hackathon, NUS',
                'date': '2025',
                'bullets': [
                    'Turned raw operating data into a dashboard a team could act on, built with a group over a weekend hackathon'
                ]
            },
            {
                'title': 'Crackerjack Convention',
                'date': '2024',
                'subtitle': 'Workshop Facilitator',
                'bullets': [
                    'Ran workshops at a multi disciplinary convention, walking groups of students through problems with no set answer'
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
        'Languages: Python, JavaScript, TypeScript, Java, C, C++, SQL, HTML, CSS',
        'Frameworks and Libraries: React, Node.js, Express.js, Next.js, TensorFlow, NumPy, Pandas, GeoPandas, Matplotlib, OpenCV',
        'Tools and Platforms: AWS (Lambda, API Gateway, S3, DynamoDB, SNS, SAM), Google Cloud, Linux, Git and GitHub, Firebase, MySQL',
        'Areas of Interest: AI/ML workflows, cloud and backend engineering, data pipelines, developer tooling, UI design'
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
