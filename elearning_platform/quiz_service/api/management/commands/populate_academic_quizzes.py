import random
from django.core.management.base import BaseCommand
from api.models import Quiz, Question, Choice
import requests

class Command(BaseCommand):
    help = 'Populate the database with comprehensive, high-quality academic quizzes for all courses'

    def handle(self, *args, **options):
        self.stdout.write("Wiping existing placeholder quizzes...")
        Choice.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()

        # Define Topic Library
        topics = {
            'web': {
                'title': 'Web Development',
                'questions': [
                    ("What does HTML stand for?", ["Hyper Text Markup Language", "High Tech Multi Language", "Hyperlink and Text Management Links"], 0),
                    ("Which CSS property is used to change the background color?", ["color", "bgcolor", "background-color"], 2),
                    ("Which JavaScript method is used to write into the browser's console?", ["console.log()", "console.print()", "window.log()"], 0),
                    ("What is the purpose of the 'alt' attribute on an image?", ["To set the image size", "To provide alternative text for accessibility", "To link to another page"], 1),
                    ("Which tag is used for a top-level heading in HTML?", ["<head>", "<h6>", "<h1>"], 2),
                    ("Which company developed the React library?", ["Google", "Facebook (Meta)", "Microsoft"], 1),
                    ("In React, what hook is used to manage local state?", ["useEffect", "useState", "useContext"], 1),
                    ("What is the virtual DOM?", ["A copy of the actual DOM stored in memory", "A 3D rendering of the website", "A separate browser window"], 0),
                    ("Which CSS framework uses utility-first classes?", ["Bootstrap", "Tailwind CSS", "Foundation"], 1),
                    ("What does SQL stand for?", ["Structured Query Language", "Strong Question Logic", "Simplified Query Link"], 0)
                ]
            },
            'react': {
                'title': 'Modern React Development',
                'questions': [
                    ("What is a prop in React?", ["A short for performance", "Input data passed to a component", "A internal state of a component"], 1),
                    ("What is the purpose of keys in lists?", ["To identify elements that changed, were added, or removed", "To style the elements", "To sort the elements"], 0),
                    ("Which hook allows you to perform side effects?", ["useMemo", "useEffect", "useCallback"], 1),
                    ("What is JSX?", ["A JavaScript XML syntax extension", "A new programming language", "A CSS preprocessor"], 0),
                    ("How do you create a ref in React?", ["useRef()", "createRef()", "Both A and B"], 2),
                    ("What is the 'Children' prop?", ["A prop that allows nesting components", "A list of child components", "A method to delete children"], 0),
                    ("What is the 'Strict Mode' in React for?", ["To enforce type checking", "To identify potential problems in an application", "To stop the app on errors"], 1),
                    ("What is a Fragment?", ["A way to group a list of children without adding extra nodes to the DOM", "A broken piece of code", "A small component"], 0),
                    ("Which hook is used for performance optimization through memoization of values?", ["useMemo", "useReducer", "useRef"], 0),
                    ("What is the 'useState' return value?", ["The state value only", "The state updater only", "An array with the state value and the updater function"], 2)
                ]
            },
            'quantum': {
                'title': 'Quantum Mechanics',
                'questions': [
                    ("What is the basic unit of a quantum system?", ["Atom", "Quantum", "Quark"], 1),
                    ("Who formulated the Uncertainty Principle?", ["Einstein", "Heisenberg", "Schrödinger"], 1),
                    ("What is a qubit?", ["A basic unit of quantum information", "A tiny bit", "A quantum orbit"], 0),
                    ("What does 'superposition' mean in quantum mechanics?", ["A system exists in all states simultaneously until observed", "A system is in its highest energy state", "One state is better than another"], 0),
                    ("What is 'entanglement'?", ["When particles become connected so the state of one instantly affects the other", "When particles collide", "When code is hard to read"], 0),
                    ("Which equation is fundamental to quantum mechanics?", ["Newton's Second Law", "Schrödinger Equation", "Maxwell's Equations"], 1),
                    ("What is wave-particle duality?", ["Light behaves as both a wave and a particle", "Waves and particles are the same", "Sound travels in waves"], 0),
                    ("What is a 'photon'?", ["A quantum of light", "A piece of a proton", "A fast electron"], 0),
                    ("The 'observer effect' suggests that:", ["Observation changes the state of a quantum system", "Observing doesn't matter", "Scientists are always right"], 0),
                    ("What is quantum tunneling?", ["Particles passing through a barrier they classically shouldn't be able to", "Traveling through a wormhole", "A fast way to move data"], 0)
                ]
            },
            'finance': {
                'title': 'Financial Principles',
                'questions': [
                    ("What is an asset?", ["Something you owe", "A resource with economic value", "A type of tax"], 1),
                    ("What does 'ROI' stand for?", ["Return on Investment", "Rate of Interest", "Risk of Inflation"], 0),
                    ("What is a balance sheet?", ["A summary of financial balances at a point in time", "A list of all transactions", "A bank statement"], 0),
                    ("What is 'liquidity'?", ["The ability of an asset to be converted into cash", "The amount of water a company uses", "The profit margin"], 0),
                    ("Which of these is a 'liability'?", ["Cash", "Equipment", "Accounts Payable"], 2),
                    ("What is 'inflation'?", ["The decrease in purchasing power of money", "The increase in company size", "The rise in stock prices only"], 0),
                    ("What is a 'capital gain'?", ["Profit from the sale of an asset", "The company's starting money", "A type of fine"], 0),
                    ("What is the 'Time Value of Money'?", ["Money now is worth more than the same amount in the future", "Time is money", "Spending money takes time"], 0),
                    ("What is a 'dividend'?", ["A distribution of a portion of a company's earnings to shareholders", "A math operation", "A type of debt"], 0),
                    ("What is 'diversification'?", ["Reducing risk by investing in a variety of assets", "Focusing on one stock", "Changing company names"], 0)
                ]
            },
            'cyber': {
                'title': 'Cybersecurity Fundamentals',
                'questions': [
                    ("What does CIA stand for in security?", ["Central Intelligence Agency", "Confidentiality, Integrity, Availability", "Common Identification Authority"], 1),
                    ("What is a 'Phishing' attack?", ["Catching fish", "Fraudulent attempt to obtain sensitive info by masquerading as a trustworthy entity", "Breaking into a server"], 1),
                    ("What is 'Two-Factor Authentication'?", ["Using two passwords", "Using two different types of credentials for verification", "Answering two security questions"], 1),
                    ("What is 'Ransomware'?", ["Software that improves performance", "Malware that threatens to publish or block access to data unless a ransom is paid", "A free tool"], 1),
                    ("What is a 'Firewall'?", ["A wall made of fire", "A network security system that monitors and controls incoming/outgoing traffic", "A type of browser"], 1),
                    ("What does 'Encryption' do?", ["Compresses data", "Converts information into code to prevent unauthorized access", "Speeds up the internet"], 1),
                    ("What is a 'Brute Force' attack?", ["Using physical force", "Trial-and-error method to guess passwords", "A type of software update"], 1),
                    ("What is 'Social Engineering'?", ["Designing social networks", "Manipulating people into giving up confidential info", "Building communities"], 1),
                    ("What is an 'SQL Injection'?", ["A database backup", "Inserting malicious SQL code into input fields to manipulate a database", "Optimizing queries"], 1),
                    ("What is 'Zero-Day' vulnerability?", ["A bug fixed in zero days", "A flaw unknown to the vendor and without a patch", "A very easy bug"], 1)
                ]
            },
            'java': {
                'title': 'Java Programming',
                'questions': [
                    ("What is the JVM?", ["Java Virtual Machine", "Java Version Manager", "Java Visual Monitor"], 0),
                    ("Which keyword is used to inherit a class in Java?", ["implements", "extends", "inherits"], 1),
                    ("What is the access modifier for 'visible to all'?", ["private", "protected", "public"], 2),
                    ("How do you declare a variable that cannot be changed?", ["static", "final", "const"], 1),
                    ("What is 'abstraction'?", ["Hiding implementation details and showing only functionality", "Drawing pictures", "A type of loop"], 0),
                    ("Which collection allows unique elements only?", ["ArrayList", "LinkedList", "HashSet"], 2),
                    ("What is an 'interface'?", ["A physical screen", "A blueprint of a class that contains static constants and abstract methods", "A main method"], 1),
                    ("How do you handle exceptions in Java?", ["try-catch", "if-else", "for-each"], 0),
                    ("What is 'Polymorphism'?", ["The ability of an object to take on many forms", "Having many variables", "A type of data structure"], 0),
                    ("Which data type is used to store characters?", ["string", "char", "txt"], 1)
                ]
            },
            'anatomy': {
                'title': 'Human Anatomy',
                'questions': [
                    ("What is the largest organ in the human body?", ["Liver", "Brain", "Skin"], 2),
                    ("How many bones are in an adult human skeleton?", ["180", "206", "220"], 1),
                    ("Which tube carries food from the mouth to the stomach?", ["Trachea", "Esophagus", "Urethra"], 1),
                    ("What is the main function of the red blood cells?", ["Fighting infection", "Carrying oxygen", "Clotting"], 1),
                    ("Which organ is responsible for pumping blood?", ["Lungs", "Heart", "Kidneys"], 1),
                    ("What is the common name for the 'Patella'?", ["Kneecap", "Shin", "Elbow"], 0),
                    ("Which system is responsible for hormones?", ["Nervous", "Endocrine", "Respiratory"], 1),
                    ("What is the largest bone in the body?", ["Spine", "Femur", "Humerus"], 1),
                    ("Where are the 'Alveoli' located?", ["In the brain", "In the lungs", "In the heart"], 1),
                    ("What is the name of the 'windpipe'?", ["Larynx", "Pharynx", "Trachea"], 2)
                ]
            },
            'french': {
                'title': 'French Language',
                'questions': [
                    ("How do you say 'Hello' in French?", ["Bonjour", "Hola", "Ciao"], 0),
                    ("What does 'Merci' mean?", ["Please", "Thank you", "Goodbye"], 1),
                    ("How do you say 'The house'?", ["La maison", "Le maison", "L'maison"], 0),
                    ("Which of these is 'Apple'?", ["Pomme", "Pain", "Poire"], 0),
                    ("What is the French verb for 'To eat'?", ["Boire", "Manger", "Dormir"], 1),
                    ("How do you say 'Good evening'?", ["Bonsoir", "Bonjour", "Bonne nuit"], 0),
                    ("What does 'Chat' mean in French?", ["Bird", "Dog", "Cat"], 2),
                    ("What is the capital of France?", ["Lyon", "Paris", "Marseille"], 1),
                    ("How do you say 'Yes'?", ["Non", "Oui", "S'il vous plaît"], 1),
                    ("What is 'Friend' in French?", ["Ami", "Ennemi", "Frère"], 0)
                ]
            },
            'spanish': {
                'title': 'Spanish Language',
                'questions': [
                    ("How do you say 'Hello' in Spanish?", ["Hola", "Adiós", "Gracias"], 0),
                    ("What does 'Gracias' mean?", ["Hello", "Thank you", "Please"], 1),
                    ("How do you say 'The beach'?", ["La playa", "El playa", "Lo playa"], 0),
                    ("Which of these is 'Bread'?", ["Pan", "Queso", "Vino"], 0),
                    ("What is the Spanish verb for 'To live'?", ["Vivir", "Comer", "Hablar"], 0),
                    ("How do you say 'Good morning'?", ["Buenas noches", "Buen día", "Buenos días"], 2),
                    ("What does 'Perro' mean?", ["Cat", "Dog", "Bird"], 1),
                    ("What is the capital of Spain?", ["Barcelona", "Madrid", "Valencia"], 1),
                    ("How do you say 'One'?", ["Dos", "Uno", "Tres"], 1),
                    ("What is 'Water' in Spanish?", ["Leche", "Agua", "Jugo"], 1)
                ]
            },
            'management': {
                'title': 'General Management',
                'questions': [
                    ("What is the 'SWOT' analysis?", ["Strengths, Weaknesses, Opportunities, Threats", "Sales, Work, Operations, Tasks", "Stable, Wide, Open, True"], 0),
                    ("Who is known as the father of scientific management?", ["Steve Jobs", "Frederick Taylor", "Peter Drucker"], 1),
                    ("What is 'Delegation'?", ["Hiring people", "Assigning tasks to others", "Firing people"], 1),
                    ("What is 'Micromanagement'?", ["A good manager", "Excessive control over small details", "Managing small teams"], 1),
                    ("What is a 'KPI'?", ["Key Performance Indicator", "Keep People Informed", "Key Process Item"], 0),
                    ("What is 'Organizational Culture'?", ["The shared values and beliefs of a group", "A company party", "The office building"], 0),
                    ("Which of these is a 'Transformational Leader'?", ["One who inspires and motivates", "One who only gives orders", "One who hides in the office"], 0),
                    ("What is 'Emotional Intelligence'?", ["Being smart", "Recognizing and managing your and others' emotions", "Crying at work"], 1),
                    ("What is 'Conflict Resolution'?", ["Winning an argument", "Finding a peaceful solution to a disagreement", "Avoiding people"], 1),
                    ("What is 'Feedback'?", ["Noise", "Information about performance used for improvement", "Complaining"], 1)
                ]
            },
            'distributed': {
                'title': 'Distributed Systems',
                'questions': [
                    ("What is the CAP Theorem?", ["Consistency, Availability, Partition Tolerance", "Control, Action, Plan", "Capacity, Access, Performance"], 0),
                    ("What is 'Scalability'?", ["Changing size", "The ability to handle increased load", "Speed"], 1),
                    ("What is a 'Microservice'?", ["A small computer", "A small, independent service that communicates over a network", "A tiny code"], 1),
                    ("What is 'Consistency' in distributed systems?", ["Being always correct", "All nodes see the same data at the same time", "Never failing"], 1),
                    ("What is a 'Load Balancer'?", ["A heavy machine", "A device that distributes network traffic across multiple servers", "A scale"], 1),
                    ("What does 'Replication' mean?", ["Deleting data", "Storing the same data on multiple nodes", "Copying hardware"], 1),
                    ("What is 'Fault Tolerance'?", ["Ignoring errors", "The ability to continue operating despite failures", "Fixing bugs fast"], 1),
                    ("What is 'Idempotency'?", ["Being identical", "An operation that can be performed multiple times without changing the result beyond the initial application", "A type of encryption"], 1),
                    ("What is 'Consensus' in distributed systems?", ["Agreement among nodes on a value or state", "Voting on a leader only", "A social network"], 0),
                    ("What is 'Latency'?", ["The size of data", "The time delay in network communication", "Hard drive speed"], 1)
                ]
            },
             'photography': {
                'title': 'Photography Basics',
                'questions': [
                    ("What is 'Aperture'?", ["The shutter speed", "The opening in the lens that controls light", "The film type"], 1),
                    ("What does 'ISO' control?", ["The sensor's sensitivity to light", "The image size", "The focus"], 0),
                    ("What is the 'Rule of Thirds'?", ["Dividing an image into three parts", "A composition guideline of 3x3 grids", "Using three colors"], 1),
                    ("What is 'Bokeh'?", ["A type of lens", "The aesthetic quality of the out-of-focus parts of an image", "A fast shutter"], 1),
                    ("What is 'Depth of Field'?", ["The size of the camera", "The distance between the nearest and farthest objects in focus", "The zoom level"], 1),
                    ("Which 'Shutter Speed' is faster?", ["1/1000", "1/60", "1 sec"], 0),
                    ("What is 'White Balance'?", ["The brightness level", "Adjusting colors to look more natural", "Emptying the memory card"], 1),
                    ("What is a 'DSLR'?", ["Digital Single-Lens Reflex", "Digital Super Lens Radio", "Daily Single Light Recorder"], 0),
                    ("What is 'Prime' lens?", ["The best lens", "A lens with a fixed focal length", "A zoom lens"], 1),
                    ("What is 'Raw' format?", ["An unedited photo", "A file format with minimal processing and no compression", "A low quality photo"], 1)
                ]
            }
        }

        # Catch-all topic
        default_topic = {
            'title': 'General Academic Knowledge',
            'questions': [
                ("What is the primary method used in scientific research?", ["Trial and error", "Scientific Method", "Guessing"], 1),
                ("What does 'Ethics' refer to in academia?", ["Following rules strictly", "Moral principles that govern behavior", "Writing long papers"], 1),
                ("What is a 'Peer Review'?", ["Evaluation of work by people of similar competence", "Your friends checking your work", "Teacher grading"], 0),
                ("What is 'Plagiarism'?", ["Using citations", "Presenting someone else's work as your own", "Sharing notes"], 1),
                ("What is a 'Thesis Statement'?", ["A table of contents", "The central claim of an essay", "A bibliography"], 1),
                ("What is 'Critical Thinking'?", ["Criticizing others", "Analysis and evaluation of an issue to form a judgment", "Thinking fast"], 1),
                ("What is 'Primary Source'?", ["A textbook", "An original document from the time period under study", "A Wikipedia article"], 1),
                ("What is 'Abstract' in a paper?", ["The conclusion", "A concise summary of a research paper", "The introduction"], 1),
                ("What is 'Bibliography'?", ["A list of contributors", "A list of sources used in research", "A list of chapters"], 1),
                ("Which of these is a 'Quantitative' method?", ["Using numbers and statistics", "Using interviews and descriptions", "Using intuition"], 0)
            ]
        }

        # Get all chapters (linked to courses)
        # Since course_service and quiz_service are separate, we usually fetch courses via API.
        # But here I'll assume I can reach the course collection or I'll iterate IDs.
        
        try:
            # We'll use the course service API to get courses and chapters.
            # Assuming they are running on http://course-service:8002
            # Handle pagination
            course_service_url = "http://localhost:8002/api/courses/"
            all_courses = []
            while course_service_url:
                response = requests.get(course_service_url)
                data = response.json()
                if isinstance(data, dict) and 'results' in data:
                    all_courses.extend(data['results'])
                    course_service_url = data.get('next')
                else:
                    all_courses.extend(data)
                    course_service_url = None
            
            courses = all_courses
        except Exception as e:
            self.stdout.write(self.style.ERROR(f"Could not fetch courses from API: {e}"))
            # Fallback: create some mock data for first 120 courses if they exist
            courses = [{"id": i, "title": f"Course {i}"} for i in range(1, 122)]

        for course_data in courses:
            c_id = course_data['id']
            c_title = course_data['title'].lower()
            
            # Find best topic
            selected_topic = default_topic
            for key in topics:
                if key in c_title:
                    selected_topic = topics[key]
                    break
            
            # Get chapters for this course
            try:
                chap_res = requests.get(f"http://localhost:8002/api/courses/{c_id}/chapters/")
                chapters = chap_res.json()
            except:
                chapters = []

            if not chapters:
                # This shouldn't happen after the course_service population, but safety first
                chapters = [{"id": None, "title": "Comprehensive"}]

            for chap in chapters:
                chap_id = chap.get('id')
                chap_title = chap.get('title', 'Comprehensive Quiz')
                
                quiz = Quiz.objects.create(
                    title=f"{chap_title} Assessment",
                    description=f"A comprehensive assessment covering the core themes of {course_data['title']}.",
                    course_id=c_id,
                    chapter_id=chap_id,
                    created_by=1,
                    questions_per_attempt=min(10, len(selected_topic['questions']))
                )
                
                # Shuffle questions and pick subset or all
                q_pool = list(selected_topic['questions'])
                random.shuffle(q_pool)
                
                for i, (q_text, choices, correct_idx) in enumerate(q_pool):
                    question = Question.objects.create(
                        quiz=quiz,
                        text=q_text,
                        question_type='MCQ' if len(choices) > 2 else 'TRUE_FALSE',
                        points=1,
                        order=i
                    )
                    for j, c_text in enumerate(choices):
                        Choice.objects.create(
                            question=question,
                            text=c_text,
                            is_correct=(j == correct_idx)
                        )
            
            self.stdout.write(f"Created quizzes for: {course_data['title']}")

        self.stdout.write(self.style.SUCCESS("Database populated with real academic quizzes!"))

