import unittest
from backend.webscrapper.grow import scrape

class TestGrowScraper(unittest.TestCase):
    def test_grow_scraper_output(self):
        """
        Tests the grow scraper to ensure it generates a valid JSON output
        with the correct data structure.
        """
        # Run the scraper with a limit of 1 for a quick test run.
        fund_data, skipped = scrape(headless=True, limit=1)

        # 1. Check if the scraper returned data
        self.assertIsInstance(fund_data, list, "The scraper should return a list.")
        self.assertEqual(
            len(fund_data), 1, f"Expected 1 fund, but got {len(fund_data)}."
        )

        # 2. Check if the fund data has the expected keys
        fund = fund_data[0]
        expected_keys = [
            "name",
            "category",
            "one_year_return",
            "three_year_return",
            "five_year_return",
        ]
        for key in expected_keys:
            self.assertIn(key, fund, f"The key '{key}' is missing from the fund data.")
        
        # 3. Check that name is not empty
        self.assertTrue(fund['name'])

if __name__ == "__main__":
    unittest.main()
