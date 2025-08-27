// Maximum Subarray Sum (Kadane's Algorithm) - With Console Output

function maxSubArray(nums) {
    console.log(`\n🔍 Finding maximum subarray sum for: [${nums.join(', ')}]`);
    console.log('=' .repeat(50));
    
    let maxSum = nums[0];
    let currentSum = nums[0];
    let startIndex = 0;
    let endIndex = 0;
    let tempStart = 0;
    
    console.log(`Initial: maxSum = ${maxSum}, currentSum = ${currentSum}`);
    
    for (let i = 1; i < nums.length; i++) {
        // If adding current element gives us a larger sum, extend the subarray
        // Otherwise, start a new subarray from current element
        if (nums[i] > currentSum + nums[i]) {
            currentSum = nums[i];
            tempStart = i;
            console.log(`📍 Step ${i}: Starting new subarray at index ${i}, currentSum = ${currentSum}`);
        } else {
            currentSum = currentSum + nums[i];
            console.log(`➕ Step ${i}: Extending subarray, currentSum = ${currentSum}`);
        }
        
        // Update maximum if we found a better sum
        if (currentSum > maxSum) {
            maxSum = currentSum;
            startIndex = tempStart;
            endIndex = i;
            console.log(`🎯 New maximum found! maxSum = ${maxSum}, subarray: [${nums.slice(startIndex, endIndex + 1).join(', ')}]`);
        }
        
        console.log(`   Current state: maxSum = ${maxSum}, currentSum = ${currentSum}`);
    }
    
    console.log('\n' + '=' .repeat(50));
    console.log(`✅ RESULT:`);
    console.log(`   Maximum sum: ${maxSum}`);
    console.log(`   Subarray: [${nums.slice(startIndex, endIndex + 1).join(', ')}]`);
    console.log(`   Indices: ${startIndex} to ${endIndex}`);
    console.log('=' .repeat(50));
    
    return maxSum;
}

// Test with multiple examples
console.log('🧪 MAXIMUM SUBARRAY SUM DEMONSTRATION');

// Test Case 1
maxSubArray([-2, 1, -3, 4, -1, 2, 1, -5, 4]);

// Test Case 2
maxSubArray([1]);

// Test Case 3
maxSubArray([5, 4, -1, 7, 8]);

// Test Case 4
maxSubArray([-1, -2, -3, -4]);

// Test Case 5
maxSubArray([1, 2, 3, 4, 5]);

// Simpler version for actual submission
function maxSubArraySimple(nums) {
    let maxSum = nums[0];
    let currentSum = nums[0];
    
    for (let i = 1; i < nums.length; i++) {
        currentSum = Math.max(nums[i], currentSum + nums[i]);
        maxSum = Math.max(maxSum, currentSum);
    }
    
    return maxSum;
}

console.log('\n🚀 SIMPLE VERSION TESTS:');
console.log(`[-2,1,-3,4,-1,2,1,-5,4] => ${maxSubArraySimple([-2,1,-3,4,-1,2,1,-5,4])}`);
console.log(`[1] => ${maxSubArraySimple([1])}`);
console.log(`[5,4,-1,7,8] => ${maxSubArraySimple([5,4,-1,7,8])}`);
console.log(`[-1,-2,-3,-4] => ${maxSubArraySimple([-1,-2,-3,-4])}`);

