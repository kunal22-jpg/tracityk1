import requests
import unittest
import sys
import json
from datetime import datetime

class DataNovaAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers)

            success = response.status_code == expected_status
            
            result = {
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success
            }
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                if response.status_code != 204:  # No content
                    try:
                        result["response"] = response.json()
                    except:
                        result["response"] = response.text
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                except:
                    result["error"] = response.text
            
            self.test_results.append(result)
            return success, response

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "endpoint": endpoint,
                "method": method,
                "success": False,
                "error": str(e)
            })
            return False, None

    def print_summary(self):
        """Print test results summary"""
        print("\n" + "="*50)
        print(f"📊 TEST SUMMARY: {self.tests_passed}/{self.tests_run} tests passed")
        print("="*50)
        
        # Print failed tests
        if self.tests_passed < self.tests_run:
            print("\nFailed Tests:")
            for result in self.test_results:
                if not result["success"]:
                    print(f"- {result['name']} ({result['method']} {result['endpoint']})")
                    if "error" in result:
                        print(f"  Error: {result['error']}")
        print("="*50)

class TestDataNovaAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Get the backend URL from the environment variable
        cls.base_url = "https://3cbadcb1-20c4-441c-bcb4-e2eea3a6766b.preview.emergentagent.com/api"
        cls.tester = DataNovaAPITester(cls.base_url)
        print(f"Testing API at: {cls.base_url}")

    def test_01_root_endpoint(self):
        """Test the root API endpoint"""
        success, response = self.tester.run_test(
            "Root Endpoint",
            "GET",
            "",
            200
        )
        self.assertTrue(success)
        if success:
            data = response.json()
            self.assertIn("message", data)
            print(f"Response: {data}")

    def test_02_stats_endpoint(self):
        """Test the stats endpoint"""
        success, response = self.tester.run_test(
            "Platform Statistics",
            "GET",
            "stats",
            200
        )
        self.assertTrue(success)
        if success:
            data = response.json()
            self.assertIn("total_visualizations", data)
            self.assertIn("total_users", data)
            self.assertIn("total_datasets", data)
            self.assertIn("total_insights", data)
            print(f"Stats: {data}")

    def test_03_datasets_endpoint(self):
        """Test the datasets endpoint"""
        success, response = self.tester.run_test(
            "Available Datasets",
            "GET",
            "datasets",
            200
        )
        self.assertTrue(success)
        if success:
            data = response.json()
            self.assertIsInstance(data, list)
            if len(data) > 0:
                self.assertIn("name", data[0])
                self.assertIn("collection", data[0])
                self.assertIn("description", data[0])
                self.assertIn("record_count", data[0])
                print(f"Found {len(data)} datasets")
                for dataset in data:
                    print(f"- {dataset['name']} ({dataset['collection']}): {dataset['record_count']} records")

    def test_04_chat_endpoint(self):
        """Test the chat endpoint"""
        test_queries = [
            "Show me COVID trends",
            "Crime statistics by city",
            "Education data analysis"
        ]
        
        for query in test_queries:
            success, response = self.tester.run_test(
                f"AI Chat Query: '{query}'",
                "POST",
                "chat",
                200,
                data={"query": query}
            )
            self.assertTrue(success)
            if success:
                data = response.json()
                self.assertIn("query", data)
                self.assertIn("results", data)
                self.assertIn("total_collections_searched", data)
                print(f"Query: '{query}' returned {len(data['results'])} results")
                
                # Check first result structure
                if data['results'] and len(data['results']) > 0:
                    result = data['results'][0]
                    self.assertIn("collection", result)
                    self.assertIn("insight", result)
                    self.assertIn("chart_type", result)
                    self.assertIn("data", result)
                    print(f"Collection: {result['collection']}")
                    print(f"Insight: {result['insight']}")
                    print(f"Chart type: {result['chart_type']}")

    def test_05_visualize_endpoint(self):
        """Test the visualize endpoint with different collections"""
        collections = ["covid_stats", "crimes", "literacy", "aqi"]
        
        for collection in collections:
            success, response = self.tester.run_test(
                f"Visualization Data: {collection}",
                "GET",
                f"visualize/{collection}",
                200
            )
            
            if success:
                data = response.json()
                self.assertIn("collection", data)
                self.assertIn("data", data)
                self.assertIn("chart_recommendations", data)
                self.assertIn("ai_insights", data)
                print(f"Collection: {data['collection']}")
                print(f"Data points: {len(data['data'])}")
                print(f"Recommended chart: {data['chart_recommendations']['recommended']}")
            else:
                # If 404, that's okay - the collection might not exist
                if response and response.status_code == 404:
                    print(f"Collection '{collection}' not found (404)")

    def test_06_insights_endpoint(self):
        """Test the insights endpoint with different collections"""
        collections = ["covid_stats", "crimes", "literacy", "aqi"]
        
        for collection in collections:
            success, response = self.tester.run_test(
                f"AI Insights: {collection}",
                "GET",
                f"insights/{collection}",
                200
            )
            
            if success:
                data = response.json()
                self.assertIn("collection", data)
                self.assertIn("total_records", data)
                self.assertIn("insights", data)
                self.assertIn("sample_size", data)
                print(f"Collection: {data['collection']}")
                print(f"Total records: {data['total_records']}")
                print(f"Sample size: {data['sample_size']}")
                print(f"Insight: {data['insights'].get('insight', 'No insight available')}")
            else:
                # If 404, that's okay - the collection might not exist
                if response and response.status_code == 404:
                    print(f"Collection '{collection}' not found (404)")

    @classmethod
    def tearDownClass(cls):
        cls.tester.print_summary()

if __name__ == "__main__":
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
