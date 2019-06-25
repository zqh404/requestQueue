# requestQueue
模拟一个请求队列，处理在http1.0协议下大量请求数并发情况导致6-8个请求等待而阻塞后面的请求情况

## 代码

```
  import RequestQueue from './queue2.js'
  
  let queue = new RequestQueue({
      limitRequests: 10
  })
  
  let asyncFun = (x) =>{
    return new Promise((resolve, reject) => {
        setTimeout(()=>{
           resolve('successful: ', i)
        }, 1000)
    })
  }
  
  const DEFAULTNUM = 10
  
  for(let i = 0; i < DEFAULTNUM;i++){
      queue.add(asyncFun(i))  
  }
```
