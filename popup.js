//options menu dummy
document.addEventListener("DOMContentLoaded",function(){
    const minusButton = document.getElementById("minus");
    const plusButton = document.getElementById("plus");
    const dayInput = document.querySelector(".quantity-num");
    var timeout, interval;
    function clearTimers() {
        clearTimeout(timeout);
        clearInterval(interval);
      }

    plusButton.addEventListener('mousedown', function() {
        
        if(dayInput.value<99)
        dayInput.value++;
        
        timeout = setTimeout(function() {
          interval = setInterval(function() {
            if(dayInput.value<99)
        dayInput.value++;
          }, 100);    
        }, 300);
    });

    plusButton.addEventListener('mouseup', clearTimers);
    plusButton.addEventListener('mouseleave', clearTimers); 
    
    minusButton.addEventListener('mousedown', function() {
        
        if(dayInput.value>1)
        dayInput.value--;
        
        timeout = setTimeout(function() {
          interval = setInterval(function() {
            if(dayInput.value>1)
        dayInput.value--;
          }, 100);    
        }, 300);
    });

    minusButton.addEventListener('mouseup', clearTimers);
    minusButton.addEventListener('mouseleave', clearTimers); 
})