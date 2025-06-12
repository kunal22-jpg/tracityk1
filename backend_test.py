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
    
    def test_04_datasets_endpoint(self):
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
            print(f"Found {len(data)} datasets")
            
            # Verify we have at least one dataset
            self.assertGreater(len(data), 0)
            
            # Check dataset structure
            if len(data) > 0:
                dataset = data[0]
                self.assertIn("name", dataset)
                self.assertIn("collection", dataset)
                self.assertIn("description", dataset)
                self.assertIn("record_count", dataset)
                self.assertIn("last_updated", dataset)
                
                # Verify dataset has records
                self.assertIsInstance(dataset["record_count"], int)
                self.assertGreater(dataset["record_count"], 0)
                
                print(f"Dataset: {dataset['name']}")
                print(f"Collection: {dataset['collection']}")
                print(f"Description: {dataset['description']}")
                print(f"Record count: {dataset['record_count']}")
    
    def test_05_visualize_crimes_endpoint(self):
        """Test the visualize/crimes endpoint"""
        success, response = self.tester.run_test(
            "Crimes Visualization Data",
            "GET",
            "visualize/crimes",
            200
        )
        self.assertTrue(success)
        if success:
            data = response.json()
            self.assertIn("collection", data)
            self.assertIn("data", data)
            self.assertIn("chart_recommendations", data)
            self.assertIn("ai_insights", data)
            self.assertIn("total_records", data)
            self.assertIn("metadata", data)
            
            # Verify collection name
            self.assertEqual(data["collection"], "crimes")
            
            # Verify data is returned
            self.assertIsInstance(data["data"], list)
            self.assertGreater(len(data["data"]), 0)
            
            # Verify chart recommendations
            self.assertIn("recommended", data["chart_recommendations"])
            self.assertIn("alternatives", data["chart_recommendations"])
            
            # Verify AI insights
            self.assertIn("insight", data["ai_insights"])
            self.assertTrue(data["ai_insights"]["insight"])
            
            print(f"Collection: {data['collection']}")
            print(f"Records: {data['total_records']}")
            print(f"Recommended chart: {data['chart_recommendations']['recommended']}")
            print(f"AI insight: {data['ai_insights']['insight'][:100]}...")
    
    def test_06_insights_crimes_endpoint(self):
        """Test the insights/crimes endpoint"""
        success, response = self.tester.run_test(
            "Crimes Insights",
            "GET",
            "insights/crimes",
            200
        )
        self.assertTrue(success)
        if success:
            data = response.json()
            self.assertIn("collection", data)
            self.assertIn("total_records", data)
            self.assertIn("insights", data)
            self.assertIn("sample_size", data)
            self.assertIn("metadata", data)
            self.assertIn("applied_filters", data)
            self.assertIn("generated_at", data)
            
            # Verify collection name
            self.assertEqual(data["collection"], "crimes")
            
            # Verify insights
            self.assertIn("insight", data["insights"])
            self.assertIn("chart_type", data["insights"])
            self.assertIn("key_findings", data["insights"])
            
            # Verify sample size
            self.assertGreater(data["sample_size"], 0)
            
            print(f"Collection: {data['collection']}")
            print(f"Total records: {data['total_records']}")
            print(f"Sample size: {data['sample_size']}")
            print(f"Insight: {data['insights']['insight'][:100]}...")
            print(f"Chart type: {data['insights']['chart_type']}")
            print(f"Key findings: {data['insights']['key_findings']}")
    
    def test_07_chat_endpoint_with_air_quality_query(self):
        """Test the chat endpoint with an air quality query"""
        test_query = "Analyze air quality data"
        
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
            
            # Verify the query was processed correctly
            self.assertEqual(data["query"], test_query)
            
            # Verify at least one result was returned
            self.assertGreater(len(data["results"]), 0)
            
            # Check if any result is related to air quality
            aqi_found = False
            for result in data["results"]:
                if "aqi" in result["collection"].lower():
                    aqi_found = True
                    print(f"Found AQI data in collection: {result['collection']}")
                    print(f"Insight: {result['insight'][:100]}...")
                    break
            
            # Note: This might not always be true depending on how the backend processes the query
            # So we're not asserting it, just logging it
            if not aqi_found:
                print("Note: No specific AQI collection found in results, but query was processed")

    @classmethod
    def tearDownClass(cls):
        cls.tester.print_summary()

if __name__ == "__main__":
    unittest.main(argv=['first-arg-is-ignored'], exit=False)
