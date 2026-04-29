import random
from django.core.management.base import BaseCommand
from api.models import Quiz, Question, Choice
import requests

class Command(BaseCommand):
    help = 'Populate the database with comprehensive 20-question pools for all courses'

    def handle(self, *args, **options):
        self.stdout.write("Wiping existing placeholder quizzes...")
        Choice.objects.all().delete()
        Question.objects.all().delete()
        Quiz.objects.all().delete()

        # Define Topic Library (20 questions each)
        topics = {
            'web': {
                'title': 'Web Systems & Development',
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
                    ("What does SQL stand for?", ["Structured Query Language", "Strong Question Logic", "Simplified Query Link"], 0),
                    ("What is a 404 error?", ["Server internal error", "Page not found", "Unauthorized access"], 1),
                    ("Which HTTP method is typically used to create a new resource?", ["GET", "PUT", "POST"], 2),
                    ("What is the purpose of a CSS Media Query?", ["To query a database", "To apply styles based on device characteristics", "To play video"], 1),
                    ("What does JSON stand for?", ["JavaScript Object Notation", "Java System Online Node", "Joint Simple Object Network"], 0),
                    ("What is a 'Full Stack' developer?", ["A database expert", "A developer who works on both frontend and backend", "A mobile app designer"], 1),
                    ("Which protocol is secure for web browsing?", ["HTTP", "FTP", "HTTPS"], 2),
                    ("What is the purpose of the 'head' section in HTML?", ["To display titles on the page", "To contain metadata and links to scripts/styles", "To create a header"], 1),
                    ("What is an 'API'?", ["A programming language", "A set of protocols for building software applications", "A database type"], 1),
                    ("Which tag is used to create a clickable link?", ["<link>", "<a>", "<button>"], 1),
                    ("What is 'Local Storage' in a browser?", ["A way to store data with no expiration date", "A temporary cache", "A database on the server"], 0)
                ]
            },
            'react': {
                'title': 'Modern React Architecture',
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
                    ("What is the 'useState' return value?", ["The state value only", "The state updater only", "An array with the state value and the updater function"], 2),
                    ("What is 'lifting state up'?", ["Moving state to a common ancestor to share it between components", "Making state global", "Increasing state complexity"], 0),
                    ("What is a controlled component?", ["A component that manages its own state", "A component whose value is controlled by React state", "A component with many props"], 1),
                    ("Which lifecycle method is replaced by useEffect with an empty dependency array?", ["componentDidUpdate", "componentDidMount", "componentWillUnmount"], 1),
                    ("What does 'Redux' primarily manage?", ["Global application state", "Component styling", "Database connections"], 0),
                    ("What is a 'Higher-Order Component' (HOC)?", ["A component that renders children", "A function that takes a component and returns a new component", "A parent component"], 1),
                    ("What is the purpose of 'Context API'?", ["To manage local state", "To pass data through the component tree without prop drilling", "To handle API calls"], 1),
                    ("Which hook is used to access the context value?", ["useState", "useContext", "useReducer"], 1),
                    ("What is the 'dependency array' in useEffect?", ["A list of components", "A list of variables that trigger the effect when they change", "A list of files"], 1),
                    ("What is 'React Fiber'?", ["A new styling engine", "A complete rewrite of the React core algorithm for better performance", "A way to use fiber optics"], 1),
                    ("What is a 'pure component'?", ["A component that never re-renders", "A component that renders the same output for the same props/state", "A functional component"], 1)
                ]
            },
            'quantum': {
                'title': 'Quantum Physics & Mechanics',
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
                    ("What is quantum tunneling?", ["Particles passing through a barrier they classically shouldn't be able to", "Traveling through a wormhole", "A fast way to move data"], 0),
                    ("What is Planck's constant used for?", ["Measuring gravity", "Relating energy of a photon to its frequency", "Calculating speed of sound"], 1),
                    ("What is the 'Many-Worlds Interpretation'?", ["A theory about aliens", "A theory suggesting every quantum outcome happens in a branching universe", "A map of the solar system"], 1),
                    ("What is a 'Spin' in quantum mechanics?", ["A physical rotation", "An intrinsic form of angular momentum", "A fast movement"], 1),
                    ("What is the 'exclusion principle' (Pauli)?", ["No two electrons can occupy the same quantum state", "All particles are unique", "Energy cannot be destroyed"], 0),
                    ("What is a 'Bose-Einstein Condensate'?", ["A type of star", "A state of matter at near absolute zero where atoms occupy the same quantum state", "A cooling liquid"], 1),
                    ("What is a 'Fermion'?", ["A particle that follows Bose-Einstein statistics", "A particle that follows Fermi-Dirac statistics (e.g. electron)", "A unit of force"], 1),
                    ("What is 'Zero-Point Energy'?", ["Energy in a vacuum at absolute zero", "Having no money", "The energy of a dead battery"], 0),
                    ("What is a 'Quantum Dot'?", ["A small spot of light", "A nanoscale semiconductor particle with unique optical properties", "A period in a quantum paper"], 1),
                    ("What is 'Decoherence'?", ["Getting confused", "The loss of quantum coherence due to interaction with the environment", "Breaking a particle"], 1),
                    ("What is a 'Hamiltonian' in quantum mechanics?", ["A famous musical", "An operator corresponding to the total energy of the system", "A type of particle"], 1)
                ]
            },
            'finance': {
                'title': 'Advanced Financial Economics',
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
                    ("What is 'diversification'?", ["Reducing risk by investing in a variety of assets", "Focusing on one stock", "Changing company names"], 0),
                    ("What is 'Beta' in finance?", ["A test version of an app", "A measure of a stock's volatility relative to the overall market", "A type of bond"], 1),
                    ("What is a 'Bond'?", ["A strong connection", "A fixed income instrument representing a loan by an investor to a borrower", "A share of ownership"], 1),
                    ("What is 'Compound Interest'?", ["Interest on the principal only", "Interest calculated on the principal and accumulated interest", "A complex math problem"], 1),
                    ("What is a 'Bull Market'?", ["A market with falling prices", "A market with rising prices", "A market for livestock"], 1),
                    ("What does 'GDP' stand for?", ["Gross Domestic Product", "Global Debt Percent", "General Development Plan"], 0),
                    ("What is 'Leverage'?", ["A heavy tool", "The use of borrowed money to increase the potential return of an investment", "A type of insurance"], 1),
                    ("What is an 'Option'?", ["A choice to do something", "A contract giving the right to buy or sell an asset at a set price", "A secondary bank account"], 1),
                    ("What is the 'Dow Jones Industrial Average'?", ["A list of rich people", "A stock market index tracking 30 large, publicly owned companies", "A bank interest rate"], 1),
                    ("What is a 'Portfolio'?", ["A leather case", "A grouping of financial assets such as stocks and bonds", "A business plan"], 1),
                    ("What is 'Arbitrage'?", ["A type of court case", "The simultaneous purchase and sale of an asset to profit from a difference in price", "A financial fine"], 1)
                ]
            },
            'cyber': {
                'title': 'Cybersecurity & Defense',
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
                    ("What is 'Zero-Day' vulnerability?", ["A bug fixed in zero days", "A flaw unknown to the vendor and without a patch", "A very easy bug"], 1),
                    ("What is a 'VPN'?", ["Virtual Private Network", "Very Personal Name", "Validated Proxy Node"], 0),
                    ("What is 'Malware'?", ["Software that is hard to use", "Software specifically designed to disrupt, damage, or gain unauthorized access to a computer system", "A broken hardware"], 1),
                    ("What is a 'DDOS' attack?", ["A fast download", "Distributed Denial of Service - overwhelming a target with traffic", "A type of data breach"], 1),
                    ("What is 'Hashing'?", ["Cooking breakfast", "Transforming data into a fixed-length string of characters for verification", "Storing data in the cloud"], 1),
                    ("What is 'Digital Forensics'?", ["Predicting the future", "The application of scientific investigation techniques to digital crimes", "A type of programming"], 1),
                    ("What is a 'White Hat' hacker?", ["A beginner hacker", "An ethical security professional who tests systems for vulnerabilities", "A hacker who wears hats"], 1),
                    ("What is 'Penetration Testing'?", ["Testing the speed of a pen", "An authorized simulated cyberattack on a computer system to find vulnerabilities", "Checking physical security"], 1),
                    ("What is 'Cross-Site Scripting' (XSS)?", ["A type of CSS", "Injecting malicious scripts into benign websites viewed by other users", "A fast way to code"], 1),
                    ("What is a 'Botnet'?", ["A robotic net", "A network of private computers infected with malicious software and controlled as a group", "A type of internet connection"], 1),
                    ("What is 'Steganography'?", ["Writing very fast", "The practice of concealing messages or information within other non-secret data", "A type of encryption"], 1)
                ]
            },
            'java': {
                'title': 'Java Enterprise Development',
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
                    ("Which data type is used to store characters?", ["string", "char", "txt"], 1),
                    ("What is 'JDK'?", ["Java Development Kit", "Java Database Key", "Java Deploy Kernel"], 0),
                    ("What is 'Garbage Collection'?", ["Cleaning the office", "Automatic memory management process that deletes unused objects", "A type of sorting"], 1),
                    ("Which package is imported by default?", ["java.util", "java.lang", "java.io"], 1),
                    ("What is the parent class of all classes in Java?", ["Base", "Super", "Object"], 2),
                    ("What is an 'ArrayList'?", ["A fixed size array", "A resizable array implementation in Java", "A type of linked list"], 1),
                    ("Which keyword is used to access the parent class constructor?", ["parent", "super", "this"], 1),
                    ("What is 'Encapsulation'?", ["Wrapping code into a single unit (class) and protecting it", "Making code small", "Using capsules"], 0),
                    ("Which method is the starting point of any Java program?", ["start()", "main()", "run()"], 1),
                    ("What is a 'Constructor'?", ["A person who builds code", "A special method used to initialize objects", "A type of class"], 1),
                    ("What is 'Thread' in Java?", ["A piece of string", "A lightweight sub-process, the smallest unit of processing", "A network connection"], 1)
                ]
            },
            'anatomy': {
                'title': 'Human Anatomy & Physiology',
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
                    ("What is the name of the 'windpipe'?", ["Larynx", "Pharynx", "Trachea"], 2),
                    ("What is the 'diaphragm'?", ["A bone", "A muscle involved in breathing", "A part of the ear"], 1),
                    ("How many chambers are in the human heart?", ["2", "3", "4"], 2),
                    ("What is the 'cerebrum'?", ["The largest part of the brain", "A small bone", "The stomach lining"], 0),
                    ("Which vitamin is produced when skin is exposed to sunlight?", ["Vitamin A", "Vitamin C", "Vitamin D"], 2),
                    ("What is the function of the 'gallbladder'?", ["Pumping blood", "Storing bile", "Filtering air"], 1),
                    ("What are 'tendons'?", ["Tissues that connect bones to bones", "Tissues that connect muscles to bones", "A type of nerve"], 1),
                    ("Which organ removes toxins from the blood?", ["Lungs", "Liver", "Spleen"], 1),
                    ("What is 'Homeostasis'?", ["Traveling home", "The maintenance of a stable internal environment", "A type of disease"], 1),
                    ("Where is the 'humerus' located?", ["In the leg", "In the arm", "In the back"], 1),
                    ("What is the purpose of the 'large intestine'?", ["Digesting protein", "Absorbing water and forming waste", "Thinking"], 1)
                ]
            },
            'french': {
                'title': 'French Linguistics',
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
                    ("What is 'Friend' in French?", ["Ami", "Ennemi", "Frère"], 0),
                    ("How do you say 'I am' in French?", ["Je suis", "Tu es", "Il est"], 0),
                    ("What is 'Water' in French?", ["Vin", "Eau", "Lait"], 1),
                    ("How do you say 'Goodbye'?", ["Au revoir", "À bientôt", "Salut"], 0),
                    ("Which of these is 'Book'?", ["Livre", "Cahier", "Stylo"], 0),
                    ("What does 'Pain' mean in French?", ["Hurt", "Bread", "Blue"], 1),
                    ("How do you say 'My name is'?", ["Je m'appelle", "Je suis", "Mon nom"], 0),
                    ("What is 'Red' in French?", ["Bleu", "Rouge", "Vert"], 1),
                    ("How do you say 'Please'?", ["Merci", "Pardon", "S'il vous plaît"], 2),
                    ("What is 'School' in French?", ["Église", "École", "Hôtel"], 1),
                    ("How do you say 'Thank you very much'?", ["Merci bien", "Merci beaucoup", "De rien"], 1)
                ]
            },
            'spanish': {
                'title': 'Spanish Philology',
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
                    ("What is 'Water' in Spanish?", ["Leche", "Agua", "Jugo"], 1),
                    ("How do you say 'I love you' in Spanish?", ["Te quiero", "Me gusta", "Lo siento"], 0),
                    ("What is 'Friend' (male) in Spanish?", ["Enemigo", "Amigo", "Hermano"], 1),
                    ("How do you say 'Where is'?", ["¿Quién es?", "¿Cómo está?", "¿Dónde está?"], 2),
                    ("What is 'Red' in Spanish?", ["Azul", "Rojo", "Verde"], 1),
                    ("How do you say 'Please'?", ["Gracias", "Perdón", "Por favor"], 2),
                    ("What is 'House' in Spanish?", ["Casa", "Calle", "Coche"], 0),
                    ("How do you say 'How are you?'", ["¿Qué tal?", "¿Cómo estás?", "Both A and B"], 2),
                    ("What does 'Cerveza' mean?", ["Wine", "Beer", "Juice"], 1),
                    ("What is 'School' in Spanish?", ["Escuela", "Oficina", "Tienda"], 0),
                    ("How do you say 'Happy Birthday'?", ["Feliz Navidad", "Feliz cumpleaños", "Buen viaje"], 1)
                ]
            },
            'management': {
                'title': 'Strategic Management',
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
                    ("What is 'Feedback'?", ["Noise", "Information about performance used for improvement", "Complaining"], 1),
                    ("What is 'Strategic Planning'?", ["Planning for tomorrow", "Long-term goals and how to achieve them", "Managing inventory"], 1),
                    ("What is a 'Supply Chain'?", ["A chain for supplies", "The network of all entities involved in creating/selling a product", "A delivery truck"], 1),
                    ("What is 'Corporate Social Responsibility' (CSR)?", ["Paying taxes", "A business model that helps a company be socially accountable", "Managing employees"], 1),
                    ("What is 'Market Segmentation'?", ["Breaking a market into pieces", "Dividing a broad target market into subsets of consumers", "Closing stores"], 1),
                    ("What is 'Just-in-Time' (JIT) production?", ["Producing as much as possible", "Producing only what is needed, when it is needed", "Being late"], 1),
                    ("What is a 'Mission Statement'?", ["A travel plan", "A short statement of why an organization exists", "A list of products"], 1),
                    ("What is 'Change Management'?", ["Changing coins", "An approach to transitioning individuals/teams to a desired future state", "Replacing a manager"], 1),
                    ("What is 'Benchmarking'?", ["Building a bench", "Comparing business processes and performance metrics to industry bests", "Marking prices"], 1),
                    ("What is 'Outsourcing'?", ["Hiring neighbors", "Obtaining goods or services from an outside or foreign supplier", "Moving office"], 1),
                    ("What is a 'Stakeholder'?", ["Someone who eats steak", "Any person or group that has an interest in a business", "The company owner only"], 1)
                ]
            },
            'distributed': {
                'title': 'Distributed Computing Systems',
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
                    ("What is 'Latency'?", ["The size of data", "The time delay in network communication", "Hard drive speed"], 1),
                    ("What is 'Sharding'?", ["Breaking glass", "Horizontal partitioning of data in a database or search engine", "Deleting old files"], 1),
                    ("What is 'Throughput'?", ["Passing through a door", "The amount of data moved successfully from one place to another in a given time", "Internet speed"], 1),
                    ("What is a 'Distributed Hash Table' (DHT)?", ["A shared breakfast", "A decentralized storage system that provides a lookup service", "A type of encrypted key"], 1),
                    ("What is 'Eventual Consistency'?", ["Being right later", "A consistency model where all updates will propagate eventually", "Never being right"], 1),
                    ("What is 'Raft' or 'Paxos'?", ["Boats", "Consensus algorithms for distributed systems", "Network cables"], 1),
                    ("What is a 'Zombie process' in computing?", ["A virus", "A process that has completed execution but still has an entry in the process table", "A slow app"], 1),
                    ("What is 'Docker' used for?", ["Building ships", "Developing, shipping, and running applications inside containers", "Storing files"], 1),
                    ("What is 'Kubernetes'?", ["A math term", "An open-source system for automating deployment, scaling, and management of containerized applications", "A Google search engine"], 1),
                    ("What is 'RPC'?", ["Remote Procedure Call", "Radio Post Card", "Real Power Connection"], 0),
                    ("What is 'Middleware'?", ["Clothing for the waist", "Software that provides common services and capabilities to applications outside of the OS", "A mid-sized computer"], 1)
                ]
            },
            'photography': {
                'title': 'Digital Photography & Imaging',
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
                    ("What is 'Raw' format?", ["An unedited photo", "A file format with minimal processing and no compression", "A low quality photo"], 1),
                    ("What is 'Exposure Triangle'?", ["ISO, Aperture, Shutter Speed", "Light, Color, Shadow", "Lens, Body, Tripod"], 0),
                    ("What is 'Macro' photography?", ["Photography from far away", "Extreme close-up photography, usually of very small subjects", "Large scale photos"], 1),
                    ("What is 'Vignetting'?", ["A cooking term", "Reduction of an image's brightness at the periphery compared to the center", "A type of lens cleaning"], 1),
                    ("What is a 'Polarizing Filter'?", ["A filter for cold weather", "A filter that reduces reflections and increases color saturation", "A lens cap"], 1),
                    ("What is 'Golden Hour'?", ["Winning a prize", "The period shortly after sunrise or before sunset with soft, warm light", "Twelve o'clock"], 1),
                    ("What is 'Leading Lines'?", ["Lines that follow you", "Lines in a photo that draw the viewer's eye towards the subject", "The text under a photo"], 1),
                    ("What is 'Flash Sync Speed'?", ["Speed of lightning", "The fastest shutter speed at which the entire sensor is exposed to the flash", "Charging time"], 1),
                    ("What is 'Dynamic Range'?", ["Moving fast", "The ratio between the maximum and minimum measurable light intensities", "The zoom range"], 1),
                    ("What is 'Histogram' in photography?", ["A history book", "A graphical representation of the tonal values of an image", "A map of locations"], 1),
                    ("What is 'Full Frame' sensor?", ["A sensor the size of a 35mm film frame", "A very large camera", "A sensor with no borders"], 0)
                ]
            }
        }

        # Catch-all topic (General Academic Knowledge - 20 questions)
        default_topic = {
            'title': 'Comprehensive Academic Foundations',
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
                ("Which of these is a 'Quantitative' method?", ["Using numbers and statistics", "Using interviews and descriptions", "Using intuition"], 0),
                ("What is a 'Hypothesis'?", ["A proven fact", "A proposed explanation made on the basis of limited evidence", "A wild guess"], 1),
                ("What is 'Qualitative' research?", ["Research using math", "Research focusing on descriptions and meaning", "Checking quality"], 1),
                ("What is an 'Appendix' in a paper?", ["A body part", "Supplementary material at the end of a document", "The first page"], 1),
                ("What is 'Citation'?", ["A police ticket", "A reference to a source of information", "A type of sentence"], 1),
                ("What is 'Case Study'?", ["Studying a briefcase", "An in-depth investigation of a single person, group, or event", "A quick survey"], 1),
                ("What is 'Literature Review'?", ["Reading books for fun", "A comprehensive summary of previous research on a topic", "Writing a story"], 1),
                ("What is 'Empirical Evidence'?", ["The word of an emperor", "Information acquired by observation or experimentation", "Logical guesses"], 1),
                ("What is 'Correlation'?", ["A causal link", "A statistical relationship between two variables", "Being identical"], 1),
                ("What is 'Bias' in research?", ["Being honest", "A prejudice in favor of or against one thing", "Using too many sources"], 1),
                ("What is 'APA' or 'MLA'?", ["Types of software", "Style guides for academic writing and citation", "Government agencies"], 1)
            ]
        }

        # Use course service API to get courses and chapters.
        try:
            course_service_url = "http://course-service:8002/api/courses/"
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
            courses = [{"id": i, "title": f"Course {i}"} for i in range(1, 122)]

        for course_data in courses:
            c_id = course_data['id']
            c_title = course_data['title'].lower()
            
            # Mapping multiple keywords to the same pool
            topics['html'] = topics['web']
            topics['css'] = topics['web']
            
            selected_topic = default_topic
            for key in topics:
                if key in c_title:
                    selected_topic = topics[key]
                    break
            
            try:
                chap_res = requests.get(f"http://course-service:8002/api/courses/{c_id}/chapters/")
                chapters = chap_res.json()
            except:
                chapters = []

            if not chapters:
                chapters = [{"id": None, "title": "Comprehensive Knowledge Check"}]

            for chap in chapters:
                chap_id = chap.get('id')
                chap_title = chap.get('title')
                
                quiz = Quiz.objects.create(
                    title=f"Knowledge Quiz: {chap_title}",
                    description=f"Evaluate your understanding of {chap_title}. Passing this unlocks the next level.",
                    course_id=c_id,
                    chapter_id=chap_id,
                    created_by=1, # Admin
                    questions_per_attempt=10, # IMPORTANT: subset from the 20-question pool
                    passing_score=70
                )

                # Add 20 questions to the pool
                for q_text, c_list, correct_idx in selected_topic['questions']:
                    q = Question.objects.create(
                        quiz=quiz,
                        text=q_text,
                        question_type='MCQ'
                    )
                    for idx, c_text in enumerate(c_list):
                        Choice.objects.create(
                            question=q,
                            text=c_text,
                            is_correct=(idx == correct_idx)
                        )

            self.stdout.write(self.style.SUCCESS(f"Created quizzes for: {course_data['title']}"))

        self.stdout.write(self.style.SUCCESS('Database populated with 20-question pools for all courses!'))
