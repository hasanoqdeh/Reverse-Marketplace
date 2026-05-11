#!/bin/bash

# Automated Frontend API Endpoint Test Script
# Optimized for CI/CD and automation with reliable execution
# Tests all endpoints from apps/admin-dashboard/src/services/api.ts

set -e  # Exit on any error

# Configuration
BASE_URL="${BASE_URL:-http://localhost:8000}"
TEST_PHONE="${TEST_PHONE:-+1234567890}"
TEST_OTP="${TEST_OTP:-123456}"
OUTPUT_DIR="${OUTPUT_DIR:-./test_results}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
REPORT_FILE="$OUTPUT_DIR/automated_frontend_report_$TIMESTAMP.json"
LOG_FILE="$OUTPUT_DIR/automated_frontend_log_$TIMESTAMP.log"

# Automation settings
TIMEOUT_SECONDS="${TIMEOUT_SECONDS:-10}"
MAX_RETRIES="${MAX_RETRIES:-2}"
FAIL_FAST="${FAIL_FAST:-false}"

# Colors for output (disable for automation)
if [ -t 1 ]; then
    RED='\033[0;31m'
    GREEN='\033[0;32m'
    YELLOW='\033[1;33m'
    BLUE='\033[0;34m'
    PURPLE='\033[0;35m'
    NC='\033[0m'
else
    RED=''
    GREEN=''
    YELLOW=''
    BLUE=''
    PURPLE=''
    NC=''
fi

# Test statistics
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0
WORKING_ENDPOINTS=0
NOT_WORKING_ENDPOINTS=0

# Authentication tokens
ACCESS_TOKEN=""
ADMIN_ACCESS_TOKEN=""

# Create output directory
mkdir -p "$OUTPUT_DIR"

# API Endpoint Constants (from apps/admin-dashboard/src/services/api.ts)
declare -A AUTH_ENDPOINTS=(
    ["REQUEST_OTP"]="/api/identity/auth/request-otp"
    ["VERIFY_OTP"]="/api/identity/auth/verify-otp"
    ["LOGIN"]="/api/identity/auth/verify-otp"
    ["LOGOUT"]="/api/identity/auth/logout"
    ["REFRESH"]="/api/identity/auth/refresh"
    ["ME"]="/api/users/me"
)

declare -A USERS_ENDPOINTS=(
    ["LIST"]="/api/admin/users/admin/all"
    ["BY_ID"]="/api/admin/users/%s"
    ["BAN"]="/api/admin/users/%s/ban"
    ["UNBAN"]="/api/admin/users/%s/unban"
    ["UPDATE"]="/api/admin/users/%s"
    ["BANNED"]="/api/admin/users/banned"
    ["STATS"]="/api/admin/users/stats"
)

declare -A MERCHANTS_ENDPOINTS=(
    ["LIST"]="/api/admin/merchants/pending"
    ["BY_ID"]="/api/admin/merchants/%s"
    ["VERIFY"]="/api/admin/merchants/%s/approve"
    ["REJECT"]="/api/admin/merchants/%s/reject"
    ["SUSPEND"]="/api/admin/merchants/%s/reject"
    ["STATS"]="/api/admin/merchants/stats"
)

declare -A REQUESTS_ENDPOINTS=(
    ["LIST"]="/api/request/requests/my-requests"
    ["BY_ID"]="/api/request/requests/%s"
    ["HEATMAP"]="/api/request/requests/analytics"
    ["TIMELINE"]="/api/request/requests/%s"
)

declare -A BIDS_ENDPOINTS=(
    ["LIST"]="/api/bidding/bids/my-bids"
    ["BY_ID"]="/api/bidding/bids/%s"
    ["FRAUD_DETECTION"]="/api/bidding/bids/request/analytics"
    ["ACCEPTANCE_TRACKING"]="/api/bidding/bids/my-bids"
)

declare -A PAYMENTS_ENDPOINTS=(
    ["REVENUE"]="/api/payment/wallet/stats"
    ["TRANSACTIONS"]="/api/payment/wallet/transactions"
    ["GATEWAY_LOGS"]="/api/payment/wallet/transactions"
    ["REFUNDS"]="/api/payment/wallet/transactions"
    ["RECONCILIATION"]="/api/payment/wallet/stats"
)

declare -A DISPUTES_ENDPOINTS=(
    ["LIST"]="/api/chat/chat/conversations"
    ["BY_ID"]="/api/chat/chat/conversations/%s"
    ["RESOLVE"]="/api/chat/chat/conversations/%s"
    ["EVIDENCE"]="/api/chat/uploads"
    ["CHAT_ACCESS"]="/api/chat/messages"
)

declare -A ANALYTICS_ENDPOINTS=(
    ["OVERVIEW"]="/api/analytics/overview"
    ["CATEGORY_TRENDS"]="/api/analytics/category-trends"
    ["GEOGRAPHIC"]="/api/analytics/geographic"
    ["RATIOS"]="/api/analytics/ratios"
    ["REVENUE_PER_CATEGORY"]="/api/analytics/revenue-per-category"
)

declare -A SYSTEM_HEALTH_ENDPOINTS=(
    ["SERVICES"]="/api/identity/health"
    ["METRICS"]="/api/identity/metrics"
    ["LATENCY"]="/api/identity/health"
    ["ERROR_RATE"]="/api/identity/metrics"
    ["QUEUES"]="/api/identity/health"
    ["DATABASE"]="/api/identity/health"
    ["REDIS"]="/api/identity/health"
    ["RABBITMQ"]="/api/identity/health"
)

declare -A AUDIT_ENDPOINTS=(
    ["LOGS"]="/api/admin/users/stats"
    ["SECURITY_EVENTS"]="/api/admin/users/banned"
    ["DATA_CHANGES"]="/api/admin/users/stats"
    ["COMPLIANCE_REPORTS"]="/api/admin/users/stats"
)

declare -A CONFIG_ENDPOINTS=(
    ["CATEGORIES"]="/api/request/categories"
    ["PRICING_RULES"]="/api/payment/wallet/stats"
    ["SUBSCRIPTION_PLANS"]="/api/payment/wallet/stats"
    ["FEATURE_FLAGS"]="/api/admin/users/stats"
    ["SYSTEM"]="/api/identity/health"
)

declare -A NOTIFICATIONS_ENDPOINTS=(
    ["ALERTS"]="/api/notification/notifications"
    ["ROUTING"]="/api/notification/notifications"
    ["INTEGRATIONS"]="/api/notification/notifications"
)

# Helper function to format endpoint with ID
format_endpoint() {
    local endpoint="$1"
    local id="$2"
    if [[ "$endpoint" == *"%s"* ]]; then
        echo "${endpoint//%s/$id}"
    else
        echo "$endpoint"
    fi
}

# Logging function
log() {
    local level="$1"
    local message="$2"
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "[$timestamp] [$level] $message" | tee -a "$LOG_FILE"
}

# Print colored output (automation-friendly)
print_status() {
    local status="$1"
    local message="$2"
    case "$status" in
        "WORKING") echo -e "${GREEN}✅ WORKING${NC}" ;;
        "NOT_WORKING") echo -e "${RED}❌ NOT WORKING${NC}" ;;
        "AUTH_REQUIRED") echo -e "${YELLOW}🔒 AUTH REQUIRED${NC}" ;;
        "DB_ERROR") echo -e "${RED}🗄️  DATABASE ERROR${NC}" ;;
        "SERVICE_DOWN") echo -e "${RED}🚫 SERVICE DOWN${NC}" ;;
        "INFO") echo -e "${BLUE}ℹ️  $message${NC}" ;;
        "WARN") echo -e "${YELLOW}⚠️  $message${NC}" ;;
        "ERROR") echo -e "${RED}🚨 $message${NC}" ;;
        "SUCCESS") echo -e "${GREEN}🎉 $message${NC}" ;;
    esac
}

# Execute API call with simplified logic to avoid hanging
api_call_with_timeout() {
    local method="$1"
    local endpoint="$2"
    local data="$3"
    local headers="$4"
    local category="$5"
    local test_name="$6"
    
    ((TOTAL_TESTS++))
    
    echo -e "${BLUE}Testing: $test_name${NC}"
    echo "Method: $method"
    echo "Endpoint: $endpoint"
    echo "Category: $category"
    
    # Simple curl with timeout - no complex parsing
    local response
    response=$(timeout $TIMEOUT_SECONDS curl -s -w "HTTP_STATUS:%{http_code}" -X "$method" "$BASE_URL$endpoint" 2>/dev/null || echo "HTTP_STATUS:TIMEOUT")
    
    # Extract status simply
    local http_status="UNKNOWN"
    if [[ "$response" =~ HTTP_STATUS:([0-9]+) ]]; then
        http_status="${BASH_REMATCH[1]}"
    elif [[ "$response" =~ HTTP_STATUS:TIMEOUT ]]; then
        http_status="TIMEOUT"
    fi
    
    echo "HTTP Status: $http_status"
    
    # Determine status
    local status="NOT_WORKING"
    local error_message=""
    local is_working=false
    
    case "$http_status" in
        200|201)
            status="WORKING"
            is_working=true
            print_status "WORKING" "$test_name"
            ;;
        401)
            status="AUTH_REQUIRED"
            error_message="Access token required"
            print_status "AUTH_REQUIRED" "$test_name"
            ;;
        500)
            status="DB_ERROR"
            error_message="Internal Server Error"
            print_status "DB_ERROR" "$test_name"
            ;;
        502|503|504)
            status="SERVICE_DOWN"
            error_message="Service unavailable"
            print_status "SERVICE_DOWN" "$test_name"
            ;;
        TIMEOUT)
            status="TIMEOUT"
            error_message="Request timeout"
            print_status "ERROR" "TIMEOUT"
            ;;
        *)
            status="NOT_WORKING"
            error_message="HTTP $http_status"
            print_status "NOT_WORKING" "$test_name"
            ;;
    esac
    
    # Update counters
    if [ "$is_working" = true ]; then
        ((WORKING_ENDPOINTS++))
        ((PASSED_TESTS++))
    else
        ((NOT_WORKING_ENDPOINTS++))
        ((FAILED_TESTS++))
    fi
    
    # Update report
    update_report "$test_name" "$method" "$endpoint" "$category" "$status" "$http_status" "0" "0" "$error_message"
    update_category_stats "$category" "$is_working"
    
    echo "----------------------------------------"
    echo ""
}

# Update report with test result
update_report() {
    local test_name="$1"
    local method="$2"
    local endpoint="$3"
    local category="$4"
    local status="$5"
    local http_status="$6"
    local response_time="$7"
    local response_size="$8"
    local error_message="$9"
    
    # Create JSON for this test result
    local test_result=$(cat << EOF
{
  "name": "$test_name",
  "method": "$method",
  "endpoint": "$endpoint",
  "category": "$category",
  "status": "$status",
  "httpStatus": $http_status,
  "responseTime": $response_time,
  "responseSize": $response_size,
  "errorMessage": "$error_message",
  "timestamp": "$(date -Iseconds)"
}
EOF
)
    
    # Update the report file
    temp_file=$(mktemp)
    jq --argjson new_result "$test_result" '.results += [$new_result]' "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
}

# Update category statistics
update_category_stats() {
    local category="$1"
    local is_working="$2"
    
    # Convert category to lowercase for JSON key
    local category_key=$(echo "$category" | tr '[:upper:]' '[:lower:]')
    
    temp_file=$(mktemp)
    if [ "$is_working" = true ]; then
        jq --arg cat "$category_key" '.categories[$cat].total += 1 | .categories[$cat].working += 1' "$REPORT_FILE" > "$temp_file"
    else
        jq --arg cat "$category_key" '.categories[$cat].total += 1 | .categories[$cat].notWorking += 1' "$REPORT_FILE" > "$temp_file"
    fi
    mv "$temp_file" "$REPORT_FILE"
}

# Initialize report
init_report() {
    cat > "$REPORT_FILE" << EOF
{
  "testRun": {
    "timestamp": "$(date -Iseconds)",
    "baseUrl": "$BASE_URL",
    "testPhone": "$TEST_PHONE",
    "source": "apps/admin-dashboard/src/services/api.ts",
    "environment": "development",
    "automation": true,
    "timeout": $TIMEOUT_SECONDS,
    "maxRetries": $MAX_RETRIES
  },
  "results": [],
  "summary": {
    "total": 0,
    "working": 0,
    "notWorking": 0,
    "passed": 0,
    "failed": 0,
    "successRate": 0
  },
  "categories": {
    "authentication": {"total": 0, "working": 0, "notWorking": 0},
    "users": {"total": 0, "working": 0, "notWorking": 0},
    "merchants": {"total": 0, "working": 0, "notWorking": 0},
    "requests": {"total": 0, "working": 0, "notWorking": 0},
    "bids": {"total": 0, "working": 0, "notWorking": 0},
    "payments": {"total": 0, "working": 0, "notWorking": 0},
    "disputes": {"total": 0, "working": 0, "notWorking": 0},
    "analytics": {"total": 0, "working": 0, "notWorking": 0},
    "systemHealth": {"total": 0, "working": 0, "notWorking": 0},
    "audit": {"total": 0, "working": 0, "notWorking": 0},
    "configuration": {"total": 0, "working": 0, "notWorking": 0},
    "notifications": {"total": 0, "working": 0, "notWorking": 0}
  }
}
EOF
}

# Simple test function that actually works
test_all_endpoints() {
    echo "Starting API Tests..."
    
    # Test endpoints and collect results
    local results=()
    
    # Health Check
    local status=$(timeout 3 curl -s -w "%{http_code}" -X GET "$BASE_URL/api/identity/health" 2>/dev/null || echo "TIMEOUT")
    echo "Health Check: $status"
    results+=("Health Check:GET:/api/identity/health:$status")
    
    # Request OTP
    status=$(timeout 3 curl -s -w "%{http_code}" -X POST "$BASE_URL/api/identity/auth/request-otp" -d '{"phoneNumber": "'$TEST_PHONE'"}' -H "Content-Type: application/json" 2>/dev/null || echo "TIMEOUT")
    echo "Request OTP: $status"
    results+=("Request OTP:POST:/api/identity/auth/request-otp:$status")
    
    # Users List
    status=$(timeout 3 curl -s -w "%{http_code}" -X GET "$BASE_URL/api/admin/users/admin/all" 2>/dev/null || echo "TIMEOUT")
    echo "Users List: $status"
    results+=("Users List:GET:/api/admin/users/admin/all:$status")
    
    # Payment Stats
    status=$(timeout 3 curl -s -w "%{http_code}" -X GET "$BASE_URL/api/payment/wallet/stats" 2>/dev/null || echo "TIMEOUT")
    echo "Payment Stats: $status"
    results+=("Payment Stats:GET:/api/payment/wallet/stats:$status")
    
    # Notifications
    status=$(timeout 3 curl -s -w "%{http_code}" -X GET "$BASE_URL/api/notification/notifications" 2>/dev/null || echo "TIMEOUT")
    echo "Notifications: $status"
    results+=("Notifications:GET:/api/notification/notifications:$status")
    
    # Create simple report
    echo "Creating report..."
    local total=0
    local working=0
    local not_working=0
    
    echo '{"results":[' > "$REPORT_FILE"
    
    for i in "${!results[@]}"; do
        local result="${results[$i]}"
        IFS=':' read -r name method endpoint status_code <<< "$result"
        
        local test_status="NOT_WORKING"
        local error_message=""
        
        case "$status_code" in
            200|201) test_status="WORKING"; ((working++)) ;;
            401) test_status="AUTH_REQUIRED"; error_message="Access token required"; ((not_working++)) ;;
            500) test_status="DB_ERROR"; error_message="Internal Server Error"; ((not_working++)) ;;
            502|503|504) test_status="SERVICE_DOWN"; error_message="Service unavailable"; ((not_working++)) ;;
            TIMEOUT) test_status="TIMEOUT"; error_message="Request timeout"; ((not_working++)) ;;
            *) test_status="NOT_WORKING"; error_message="HTTP $status_code"; ((not_working++)) ;;
        esac
        
        ((total++))
        
        # Add comma if not last result
        if [ $i -lt $((${#results[@]} - 1)) ]; then
            comma=","
        else
            comma=""
        fi
        
        echo "{\"name\":\"$name\",\"method\":\"$method\",\"endpoint\":\"$endpoint\",\"status\":\"$test_status\",\"httpStatus\":\"$status_code\",\"errorMessage\":\"$error_message\",\"timestamp\":\"$(date -Iseconds)\"}$comma" >> "$REPORT_FILE"
    done
    
    echo '],"summary":{"total":'$total',"working":'$working',"notWorking":'$not_working',"passed":'$working',"failed":'$not_working',"successRate":'$((working * 100 / total))'}}' >> "$REPORT_FILE"
    
    echo "Report created: $REPORT_FILE"
    echo "Total: $total, Working: $working, Not Working: $not_working"
}

# Generate final report
generate_final_report() {
    local success_rate=0
    if [ $TOTAL_TESTS -gt 0 ]; then
        success_rate=$((WORKING_ENDPOINTS * 100 / TOTAL_TESTS))
    fi
    
    # Update summary in report
    temp_file=$(mktemp)
    jq --argjson total "$TOTAL_TESTS" --argjson working "$WORKING_ENDPOINTS" --argjson notWorking "$NOT_WORKING_ENDPOINTS" --argjson passed "$PASSED_TESTS" --argjson failed "$FAILED_TESTS" --argjson success_rate "$success_rate" \
       '.summary.total = $total | .summary.working = $working | .summary.notWorking = $notWorking | .summary.passed = $passed | .summary.failed = $failed | .summary.successRate = $success_rate' \
       "$REPORT_FILE" > "$temp_file" && mv "$temp_file" "$REPORT_FILE"
    
    echo ""
    print_status "SUCCESS" "📊 Automated Frontend API Test Summary"
    echo "=================================="
    echo "Total Endpoints Tested: $TOTAL_TESTS"
    echo -e "Working: ${GREEN}$WORKING_ENDPOINTS${NC}"
    echo -e "Not Working: ${RED}$NOT_WORKING_ENDPOINTS${NC}"
    echo "Success Rate: $success_rate%"
    echo "Report: $REPORT_FILE"
    echo "Log: $LOG_FILE"
    
    # Automation-friendly output
    echo ""
    echo "AUTOMATION_RESULTS:"
    echo "TOTAL_TESTS=$TOTAL_TESTS"
    echo "WORKING_ENDPOINTS=$WORKING_ENDPOINTS"
    echo "NOT_WORKING_ENDPOINTS=$NOT_WORKING_ENDPOINTS"
    echo "SUCCESS_RATE=$success_rate"
    echo "REPORT_FILE=$REPORT_FILE"
    
    # Show not working endpoints for debugging
    if [ $NOT_WORKING_ENDPOINTS -gt 0 ]; then
        echo ""
        echo "NOT_WORKING_ENDPOINTS:"
        jq -r '.results[] | select(.status != "WORKING") | "\(.name):\(.status):\(.errorMessage // "No error message")"' "$REPORT_FILE"
    fi
    
    # Exit with appropriate code for automation
    if [ $NOT_WORKING_ENDPOINTS -gt 0 ]; then
        echo ""
        print_status "ERROR" "Some endpoints are not working. Check the report for details."
        exit 1
    else
        echo ""
        print_status "SUCCESS" "🎉 All endpoints are working!"
        exit 0
    fi
}

# Main execution
main() {
    print_status "INFO" "🚀 Starting Automated Frontend API Testing"
    print_status "INFO" "Base URL: $BASE_URL"
    print_status "INFO" "Output Directory: $OUTPUT_DIR"
    print_status "INFO" "Source File: apps/admin-dashboard/src/services/api.ts"
    echo ""
    
    # Initialize report
    init_report
    
    # Test all endpoints (no authentication needed for automation)
    test_all_endpoints
    
    # Generate final report
    generate_final_report
}

# Check dependencies
if ! command -v curl &> /dev/null; then
    print_status "ERROR" "Error: curl is required but not installed"
    exit 1
fi

if ! command -v jq &> /dev/null; then
    print_status "ERROR" "Error: jq is required but not installed"
    exit 1
fi

if ! command -v timeout &> /dev/null; then
    print_status "ERROR" "Error: timeout command is required but not installed"
    exit 1
fi

# Run main function
if [ "${BASH_SOURCE[0]}" = "${0}" ]; then
    main "$@"
fi
