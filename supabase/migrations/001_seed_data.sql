-- Seed data for CodeBattle demo

-- Insert demo event
INSERT INTO events (id, name, description, start_time, end_time)
VALUES (
  '550e8400-e29b-41d4-a716-446655440000',
  'CodeBattle Hackathon 2024',
  'Annual coding competition for developers',
  NOW(),
  NOW() + INTERVAL '30 days'
) ON CONFLICT DO NOTHING;

-- Insert demo rounds
INSERT INTO rounds (id, event_id, name, type, description, start_time, end_time, duration_minutes, status, points_per_question, negative_marking, negative_percentage, qualification_percent)
VALUES
  ('660e8400-e29b-41d4-a716-446655440001', '550e8400-e29b-41d4-a716-446655440000', 'Quiz Battle', 'QUIZ', 'Test your knowledge with multiple-choice questions', NOW(), NOW() + INTERVAL '7 days', 30, 'OPEN', 10, true, 25, 50),
  ('660e8400-e29b-41d4-a716-446655440002', '550e8400-e29b-41d4-a716-446655440000', 'Coding Battle', 'CODING', 'Solve programming challenges', NOW(), NOW() + INTERVAL '8 days', 60, 'OPEN', 20, false, 0, 50),
  ('660e8400-e29b-41d4-a716-446655440003', '550e8400-e29b-41d4-a716-446655440000', 'Debugging Battle', 'DEBUGGING', 'Find and fix bugs in code', NOW(), NOW() + INTERVAL '9 days', 45, 'OPEN', 15, false, 0, 50),
  ('660e8400-e29b-41d4-a716-446655440004', '550e8400-e29b-41d4-a716-446655440000', 'Final Battle', 'FINAL', 'Advanced programming challenges for finalists', NOW(), NOW() + INTERVAL '10 days', 90, 'OPEN', 30, false, 0, 50)
ON CONFLICT DO NOTHING;

-- Insert quiz questions for Round 1
INSERT INTO questions (id, round_id, type, title, description, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440001', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'JavaScript Basics', 'What is the output of typeof null in JavaScript?', 'EASY', 10, 1),
  ('770e8400-e29b-41d4-a716-446655440002', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'React Hooks', 'Which hook is used for side effects in React?', 'EASY', 10, 2),
  ('770e8400-e29b-41d4-a716-446655440003', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'CSS Flexbox', 'Which property aligns items in a flex container?', 'EASY', 10, 3),
  ('770e8400-e29b-41d4-a716-446655440004', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'Database Indexes', 'What is the primary purpose of database indexes?', 'MEDIUM', 10, 4),
  ('770e8400-e29b-41d4-a716-446655440005', '660e8400-e29b-41d4-a716-446655440001', 'QUIZ', 'HTTP Methods', 'Which HTTP method is used to update an existing resource?', 'EASY', 10, 5)
ON CONFLICT DO NOTHING;

-- Insert quiz options
INSERT INTO question_options (id, question_id, option_text, is_correct, order_index)
VALUES
  -- Question 1 options
  ('880e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440001', 'object', false, 1),
  ('880e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440001', 'null', false, 2),
  ('880e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440001', 'object', true, 3),
  ('880e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440001', 'undefined', false, 4),
  -- Question 2 options
  ('880e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440002', 'useState', false, 1),
  ('880e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440002', 'useEffect', true, 2),
  ('880e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440002', 'useContext', false, 3),
  ('880e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440002', 'useReducer', false, 4),
  -- Question 3 options
  ('880e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440003', 'align-items', true, 1),
  ('880e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440003', 'justify-content', false, 2),
  ('880e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440003', 'flex-direction', false, 3),
  ('880e8400-e29b-41d4-a716-446655440012', '770e8400-e29b-41d4-a716-446655440003', 'flex-wrap', false, 4),
  -- Question 4 options
  ('880e8400-e29b-41d4-a716-446655440013', '770e8400-e29b-41d4-a716-446655440004', 'To store more data', false, 1),
  ('880e8400-e29b-41d4-a716-446655440014', '770e8400-e29b-41d4-a716-446655440004', 'To improve query performance', true, 2),
  ('880e8400-e29b-41d4-a716-446655440015', '770e8400-e29b-41d4-a716-446655440004', 'To encrypt data', false, 3),
  ('880e8400-e29b-41d4-a716-446655440016', '770e8400-e29b-41d4-a716-446655440004', 'To backup data', false, 4),
  -- Question 5 options
  ('880e8400-e29b-41d4-a716-446655440017', '770e8400-e29b-41d4-a716-446655440005', 'POST', false, 1),
  ('880e8400-e29b-41d4-a716-446655440018', '770e8400-e29b-41d4-a716-446655440005', 'PUT', true, 2),
  ('880e8400-e29b-41d4-a716-446655440019', '770e8400-e29b-41d4-a716-446655440005', 'GET', false, 3),
  ('880e8400-e29b-41d4-a716-446655440020', '770e8400-e29b-41d4-a716-446655440005', 'DELETE', false, 4)
ON CONFLICT DO NOTHING;

-- Insert coding questions for Round 2
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440006', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Two Sum', 'Given an array of integers nums and an integer target, return indices of the two numbers such that they add up to target.', 'function twoSum(nums, target) {\n  // Your code here\n}', 'function twoSum(nums, target) {\n  const map = new Map();\n  for (let i = 0; i < nums.length; i++) {\n    const complement = target - nums[i];\n    if (map.has(complement)) {\n      return [map.get(complement), i];\n    }\n    map.set(nums[i], i);\n  }\n  return [];\n}', 'javascript', 'EASY', 20, 1),
  ('770e8400-e29b-41d4-a716-446655440007', '660e8400-e29b-41d4-a716-446655440002', 'CODING', 'Palindrome Check', 'Write a function to check if a string is a palindrome.', 'function isPalindrome(s) {\n  // Your code here\n}', 'function isPalindrome(s) {\n  const cleaned = s.toLowerCase().replace(/[^a-z0-9]/g, '''');\n  return cleaned === cleaned.split('''').reverse().join('''');\n}', 'javascript', 'EASY', 20, 2)
ON CONFLICT DO NOTHING;

-- Insert test cases for coding questions
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  -- Two Sum test cases
  ('990e8400-e29b-41d4-a716-446655440001', '770e8400-e29b-41d4-a716-446655440006', '[2,7,11,15],9', '[0,1]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440002', '770e8400-e29b-41d4-a716-446655440006', '[3,2,4],6', '[1,2]', false, 2),
  ('990e8400-e29b-41d4-a716-446655440003', '770e8400-e29b-41d4-a716-446655440006', '[3,3],6', '[0,1]', true, 3),
  -- Palindrome test cases
  ('990e8400-e29b-41d4-a716-446655440004', '770e8400-e29b-41d4-a716-446655440007', 'racecar', 'true', false, 1),
  ('990e8400-e29b-41d4-a716-446655440005', '770e8400-e29b-41d4-a716-446655440007', 'hello', 'false', false, 2),
  ('990e8400-e29b-41d4-a716-446655440006', '770e8400-e29b-41d4-a716-446655440007', 'A man, a plan, a canal: Panama', 'true', true, 3)
ON CONFLICT DO NOTHING;

-- Insert debugging questions for Round 3
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440008', '660e8400-e29b-41d4-a716-446655440003', 'DEBUGGING', 'Bug in Array Filter', 'Find and fix the bug in this array filter function.', 'function filterEvenNumbers(arr) {\n  return arr.filter(num => num % 2 = 0);\n}', 'function filterEvenNumbers(arr) {\n  return arr.filter(num => num % 2 === 0);\n}', 'javascript', 'EASY', 15, 1)
ON CONFLICT DO NOTHING;

-- Insert test cases for debugging questions
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  ('990e8400-e29b-41d4-a716-446655440007', '770e8400-e29b-41d4-a716-446655440008', '[1,2,3,4,5,6]', '[2,4,6]', false, 1),
  ('990e8400-e29b-41d4-a716-446655440008', '770e8400-e29b-41d4-a716-446655440008', '[7,9,11,13]', '[]', false, 2)
ON CONFLICT DO NOTHING;

-- Insert final battle questions for Round 4
INSERT INTO questions (id, round_id, type, title, description, starter_code, reference_solution, language, difficulty, points, order_index)
VALUES
  ('770e8400-e29b-41d4-a716-446655440009', '660e8400-e29b-41d4-a716-446655440004', 'CODING', 'Binary Search', 'Implement binary search algorithm.', 'function binarySearch(arr, target) {\n  // Your code here\n}', 'function binarySearch(arr, target) {\n  let left = 0;\n  let right = arr.length - 1;\n  while (left <= right) {\n    const mid = Math.floor((left + right) / 2);\n    if (arr[mid] === target) return mid;\n    if (arr[mid] < target) left = mid + 1;\n    else right = mid - 1;\n  }\n  return -1;\n}', 'javascript', 'MEDIUM', 30, 1)
ON CONFLICT DO NOTHING;

-- Insert test cases for final battle
INSERT INTO test_cases (id, question_id, input, expected_output, is_hidden, order_index)
VALUES
  ('990e8400-e29b-41d4-a716-446655440009', '770e8400-e29b-41d4-a716-446655440009', '[1,2,3,4,5,6,7,8,9,10],5', '4', false, 1),
  ('990e8400-e29b-41d4-a716-446655440010', '770e8400-e29b-41d4-a716-446655440009', '[1,2,3,4,5,6,7,8,9,10],11', '-1', false, 2),
  ('990e8400-e29b-41d4-a716-446655440011', '770e8400-e29b-41d4-a716-446655440009', '[1,2,3,4,5,6,7,8,9,10],1', '0', true, 3)
ON CONFLICT DO NOTHING;
