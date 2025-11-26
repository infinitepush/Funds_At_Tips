import unittest
import json
import os


class TestGrowJSON(unittest.TestCase):
    def test_json_has_entries_and_keys(self):
        path = os.path.join(os.path.dirname(__file__), '..', '..', 'data',
                            'data.json')
        path = os.path.abspath(path)
        self.assertTrue(os.path.exists(path), f"Expected JSON file at {path}")
        with open(path, 'r', encoding='utf-8') as fh:
            data = json.load(fh)
        self.assertIsInstance(data, list)
        self.assertGreater(len(data), 0)
        for item in data:
            self.assertIn('name', item)
            self.assertIn('one_year_return', item)
            self.assertIn('three_year_return', item)
            self.assertIn('five_year_return', item)
            # name should not be empty
            self.assertTrue(item['name'] is not None and item['name'] != '')


if __name__ == '__main__':
    unittest.main()
