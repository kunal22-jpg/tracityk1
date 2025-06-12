import requests
import unittest
import sys
import json
import os
from datetime import datetime

class TRACITYAPITester:
    def __init__(self, base_url):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, params=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        
        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, params=params)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, params=params)

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
                        print(f"Response: {json.dumps(response.json(), indent=2)[:500]}...")
                    except:
                        result["response"] = response.text
                        print(f"Response: {response.text[:500]}...")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    result["error"] = response.json()
                    print(f"Error: {json.dumps(response.json(), indent=2)}")
                except:
                    result["error"] = response.text
                    print(f"Error: {response.text}")
            
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

class TestTRACITYAPI(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        # Get the backend URL from the environment variable or use the one from frontend/.env
        with open('/app/frontend/.env', 'r') as f:
            for line in f:
                if line.startswith('REACT_APP_BACKEND_URL='):
                    backend_url = line.strip().split('=')[1].strip('"\'')
                    break
        
        cls.base_url = f"{backend_url}/api"
        cls.tester = TRACITYAPITester(cls.base_url)
        print(f"Testing API at: {cls.base_url}")
        
        # Collections to test
        cls.collections = ["crimes", "covid_stats", "aqi", "literacy"]

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
            # Verify the updated branding message
            self.assertEqual(data["message"], "TRACITY API - Your AI Data Companion")
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
            
            # Verify all required fields have valid values
            self.assertIsInstance(data["total_visualizations"], int)
            self.assertIsInstance(data["total_users"], int)
            self.assertIsInstance(data["total_datasets"], int)
            self.assertIsInstance(data["total_insights"], int)
            
            # Verify values are reasonable
            self.assertGreater(data["total_visualizations"], 0)
            self.assertGreater(data["total_users"], 0)
            self.assertGreater(data["total_datasets"], 0)
            self.assertGreater(data["total_insights"], 0)

    def test_03_chat_endpoint(self):
        """Test the chat endpoint with a simple query"""
        test_query = "Show me data about crimes"
        
        success, response = self.tester.run_test(
            f"AI Chat Query: '{test_query}'",
            "POST",
            "chat",
            200,
            data={"query": test_query}
        )
        self.assertTrue(success)
        if success:
            data = response.json()
            self.assertIn("query", data)
            self.assertIn("results", data)
            self.assertIn("total_collections_searched", data)
            print(f"Query: '{test_query}' returned {len(data['results'])} results")
            
            # Verify the query was processed correctly
            self.assertEqual(data["query"], test_query)
            
            # Verify at least one result was returned
            self.assertGreater(len(data["results"]), 0)
            
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
                
                # Verify insight is not empty
                self.assertTrue(result["insight"])
                
                # Verify data is returned
                self.assertIsInstance(result["data"], list)

    @classmethod
    def tearDownClass(cls):
        cls.tester.print_summary()

if __name__ == "__main__":
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
