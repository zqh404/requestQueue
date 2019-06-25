function RequestQueue(options) {
    let t = this

    t.queue = [] //存放请求实例
    t.qIndex = 0 // 当前等待队列进队的元素下标
    t.maxRequests = options.maxRequests || 0 //最大请求数
    t.qCount = 0 //入队计数器
    t.limitRequests = options.limitRequests || 3 //限制请求数
    t.timeout = options.timeout || 5000 //超时设置，默认5秒
}

RequestQueue.prototype = {
    //入队
    add(request) {
        let t = this

        if (t.qCount < 0 || t.qCount > t.queue.length) {
            t.free()
        }

        t.queue.push(request)

        t.qCount++

        if (t.qCount === t.maxRequests) {
            //标记前limitRequests个为正在请求实例，下次递归从qIndex++开始
            t.qIndex = t.limitRequests - 1
            return t.run()
        }
    },

    //运行队列
    run() {
        let t = this

        for (let i = 0; i < t.limitRequests; i++) {

            let p = new Promise((resolve, reject)=>{
                //设置定时器
                let time = setTimeout((_i = i)=>{
                    t.deal(_i)
                    reject('time out')
                }, t.timeout)

                resolve(async function () {
                    await t.queue[i]()
                    clearTimeout(time)
                    time = null
                })

            })

            p.then((res=>{
                typeof res === 'function' ?
                    res().then(() => {
                        t.deal(i)
                    }).catch(err => {
                        t.deal(i)
                    }) :
                    t.deal(i)
            })).catch(err=>{
                t.deal(i)
            })
        }
    },

    deal(index) {
        let t = this

        t.queue[index] = null
        t.qCount--
        t.qIndex++
        t.next(t.qIndex)

    },

    //下一个请求实力入队并运行
    next(index) {
        let t = this

        /**
         * 递归结束条件：
         1、当前index 超过 总队列长度;
         2、在等待队列中不存在下一个请求实例
         */
        if (index >= t.queue.length || !t.queue[index]) {
            //队列元素为空，回收内存
            if (t.qCount === 0) {
                t.free()
            }
            return
        }

        let p = new Promise((resolve, reject)=>{
            let time = setTimeout((_i = index)=>{
                t.deal(_i)
                reject('time out')
            }, t.timeout)

            resolve(async function () {
                await t.queue[index]()
                clearTimeout(time)
                time  = null
            })
        })

        p.then(res=>{
            typeof res === 'function' ? res().then(() => {
                t.deal(index)
            }).catch(() => {
                t.deal(index)
            }) : t.deal(index)
        }).catch(()=>{
            t.deal(index)
        })
    },

    //回收内存
    free() {
        let t = this

        t.qCount = 0
        t.qIndex = 0
        t.queue = []
        t.queue.length = 0
    }
}

RequestQueue.prototype.constructor = RequestQueue

export default RequestQueue
