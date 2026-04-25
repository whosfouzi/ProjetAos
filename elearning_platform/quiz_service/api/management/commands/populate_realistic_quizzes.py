import os
import random
from django.core.management.base import BaseCommand
from api.models import Quiz, Question, Choice

class Command(BaseCommand):
    help = 'Populate the database with realistic, high-quality quiz questions'

    def handle(self, *args, **options):
        self.stdout.write("Populating realistic quizzes...")

        # Course 2: Modern Web Development with React
        react_quiz, _ = Quiz.objects.get_or_create(
            title="React Hooks & State Management",
            course_id=2,
            chapter_id=1,
            defaults={
                'description': "Test your knowledge on modern React patterns, including Hooks and state management strategies.",
                'duration_minutes': 20,
                'passing_score': 60,
                'questions_per_attempt': 5,
                'created_by': 1
            }
        )
        self.add_questions(react_quiz, [
            {
                'text': "Which hook is used to perform side effects in a functional component?",
                'type': 'MCQ',
                'choices': [
                    ('useState', False),
                    ('useEffect', True),
                    ('useContext', False),
                    ('useReducer', False)
                ]
            },
            {
                'text': "What is the primary purpose of the 'useMemo' hook?",
                'type': 'MCQ',
                'choices': [
                    ('To memoize a component', False),
                    ('To memoize an expensive calculation', True),
                    ('To handle form state', False),
                    ('To fetch data from an API', False)
                ]
            },
            {
                'text': "In React, what does 'lifting state up' mean?",
                'type': 'MCQ',
                'choices': [
                    ('Moving state to a child component', False),
                    ('Moving state to the closest common ancestor', True),
                    ('Using Redux for all state', False),
                    ('Increasing the frequency of re-renders', False)
                ]
            },
            {
                'text': "True or False: React Hooks can be called inside loops or conditions.",
                'type': 'TRUE_FALSE',
                'choices': [
                    ('True', False),
                    ('False', True)
                ]
            },
            {
                'text': "What's the difference between 'useEffect' and 'useLayoutEffect'?",
                'type': 'MCQ',
                'choices': [
                    ('useEffect runs synchronously', False),
                    ('useLayoutEffect runs synchronously after DOM mutations', True),
                    ('There is no difference', False),
                    ('useLayoutEffect is for data fetching', False)
                ]
            },
            {
                'text': "Which hook would you use to access a DOM element directly?",
                'type': 'MCQ',
                'choices': [
                    ('useRef', True),
                    ('useState', False),
                    ('useDOM', False),
                    ('useCallback', False)
                ]
            },
            {
                'text': "What does the second argument in 'useEffect' represent?",
                'type': 'MCQ',
                'choices': [
                    ('The initial state', False),
                    ('The dependency array', True),
                    ('A callback function', False),
                    ('The cleanup function', False)
                ]
            },
            {
                'text': "What is the purpose of 'useContext'?",
                'type': 'MCQ',
                'choices': [
                    ('To manage local state', False),
                    ('To pass data deep through the component tree without prop drilling', True),
                    ('To optimize performance', False),
                    ('To handle events', False)
                ]
            }
        ])

        # Course 4: Distributed Systems 101
        ds_quiz, _ = Quiz.objects.get_or_create(
            title="CAP Theorem & Consistency",
            course_id=4,
            chapter_id=1,
            defaults={
                'description': "Deep dive into CAP theorem, consistency models, and fault tolerance in distributed systems.",
                'duration_minutes': 25,
                'passing_score': 70,
                'questions_per_attempt': 6,
                'created_by': 1
            }
        )
        self.add_questions(ds_quiz, [
            {
                'text': "In the CAP theorem, what does 'A' stand for?",
                'type': 'MCQ',
                'choices': [
                    ('Atomicity', False),
                    ('Availability', True),
                    ('Agreement', False),
                    ('Automation', False)
                ]
            },
            {
                'text': "Which consistency model guarantees that all reads will return the most recent write?",
                'type': 'MCQ',
                'choices': [
                    ('Eventual Consistency', False),
                    ('Strong/Linearizable Consistency', True),
                    ('Causal Consistency', False),
                    ('Session Consistency', False)
                ]
            },
            {
                'text': "What is the primary role of the Raft algorithm?",
                'type': 'MCQ',
                'choices': [
                    ('Data compression', False),
                    ('Leader election and consensus', True),
                    ('Load balancing', False),
                    ('Database indexing', False)
                ]
            },
            {
                'text': "What happens in a 'Split Brain' scenario?",
                'type': 'MCQ',
                'choices': [
                    ('The system crashes', False),
                    ('Two or more nodes think they are the leader simultaneously', True),
                    ('The database becomes read-only', False),
                    ('Communication is lost with all clients', False)
                ]
            },
            {
                'text': "True or False: In a distributed system with a network partition, you must choose between Consistency and Availability.",
                'type': 'TRUE_FALSE',
                'choices': [
                    ('True', True),
                    ('False', False)
                ]
            },
            {
                'text': "Which of these is an example of an 'Eventual Consistency' system?",
                'type': 'MCQ',
                'choices': [
                    ('RDBMS with synchronous replication', False),
                    ('DNS (Domain Name System)', True),
                    ('Single-node SQLite', False),
                    ('Google Spanner', False)
                ]
            },
            {
                'text': "What is a 'Byzantine Fault'?",
                'type': 'MCQ',
                'choices': [
                    ('A node simply stops responding', False),
                    ('A node behaves arbitrarily or maliciously, sending conflicting information', True),
                    ('A disk failure', False),
                    ('A network timeout', False)
                ]
            },
            {
                'text': "Vector Clocks are primarily used to:",
                'type': 'MCQ',
                'choices': [
                    ('Synchronize physical clocks', False),
                    ('Detect causality and partial ordering of events', True),
                    ('Measure network latency', False),
                    ('Generate unique IDs', False)
                ]
            },
            {
                'text': "In Two-Phase Commit (2PC), what is the main risk if the coordinator fails?",
                'type': 'MCQ',
                'choices': [
                    ('Data duplication', False),
                    ('Blocking: nodes wait indefinitely for the coordinator', True),
                    ('High latency', False),
                    ('Security breach', False)
                ]
            }
        ])

        # Course 1: Quantum Physics
        quantum_quiz, _ = Quiz.objects.get_or_create(
            title="Quantum Mechanics Fundamentals",
            course_id=1,
            chapter_id=1,
            defaults={
                'description': "Foundational concepts of Quantum Mechanics: Wave-particle duality, uncertainty, and superposition.",
                'duration_minutes': 30,
                'passing_score': 65,
                'questions_per_attempt': 7,
                'created_by': 1
            }
        )
        self.add_questions(quantum_quiz, [
            {
                'text': "Who formulated the Uncertainty Principle?",
                'type': 'MCQ',
                'choices': [
                    ('Albert Einstein', False),
                    ('Werner Heisenberg', True),
                    ('Niels Bohr', False),
                    ('Erwin Schrödinger', False)
                ]
            },
            {
                'text': "What does 'Wave-Particle Duality' suggest?",
                'type': 'MCQ',
                'choices': [
                    ('Particles behave only as waves', False),
                    ('Waves behave only as particles', False),
                    ('Matter and radiation exhibit both wave-like and particle-like properties', True),
                    ('Quantum objects are neither waves nor particles', False)
                ]
            },
            {
                'text': "The 'Schrödinger's Cat' thought experiment illustrates which concept?",
                'type': 'MCQ',
                'choices': [
                    ('Entanglement', False),
                    ('Superposition until observed', True),
                    ('Tunneling', False),
                    ('The Photoelectric Effect', False)
                ]
            },
            {
                'text': "What is a 'Photon'?",
                'type': 'MCQ',
                'choices': [
                    ('A subatomic particle in the nucleus', False),
                    ('A quantum of light/electromagnetic radiation', True),
                    ('A type of electron', False),
                    ('A mathematical constant', False)
                ]
            },
            {
                'text': "True or False: Quantum entanglement implies that information can travel faster than light.",
                'type': 'TRUE_FALSE',
                'choices': [
                    ('True', False),
                    ('False', True)
                ]
            },
            {
                'text': "What is the primary equation describing how the quantum state of a physical system changes with time?",
                'type': 'MCQ',
                'choices': [
                    ('Newton\'s Second Law', False),
                    ('Schrödinger Equation', True),
                    ('Maxwell\'s Equations', False),
                    ('E=mc^2', False)
                ]
            },
            {
                'text': "Quantum Tunneling allows a particle to:",
                'type': 'MCQ',
                'choices': [
                    ('Travel back in time', False),
                    ('Pass through a potential barrier that it classicaly could not cross', True),
                    ('Disappear forever', False),
                    ('Become infinite', False)
                ]
            },
            {
                'text': "What is 'Spin' in quantum mechanics?",
                'type': 'MCQ',
                'choices': [
                    ('The physical rotation of a particle', False),
                    ('An intrinsic form of angular momentum', True),
                    ('The direction of travel', False),
                    ('The speed of a particle', False)
                ]
            },
            {
                'text': "Which phenomenon allows for Quantum Computing using Qubits?",
                'type': 'MCQ',
                'choices': [
                    ('Superposition and Entanglement', True),
                    ('The Doppler Effect', False),
                    ('Refraction', False),
                    ('Combustion', False)
                ]
            },
            {
                'text': "The exclusion principle that states no two fermions can occupy the same quantum state is named after:",
                'type': 'MCQ',
                'choices': [
                    ('Max Planck', False),
                    ('Wolfgang Pauli', True),
                    ('Enrico Fermi', False),
                    ('Richard Feynman', False)
                ]
            }
        ])

        self.stdout.write(self.style.SUCCESS('Successfully populated realistic quizzes and questions.'))

    def add_questions(self, quiz, questions_data):
        for q_data in questions_data:
            question, created = Question.objects.get_or_create(
                quiz=quiz,
                text=q_data['text'],
                defaults={
                    'question_type': q_data['type'],
                    'points': 1,
                    'order': 0
                }
            )
            if created or not question.choices.exists():
                for choice_text, is_correct in q_data['choices']:
                    Choice.objects.get_or_create(
                        question=question,
                        text=choice_text,
                        defaults={'is_correct': is_correct}
                    )

