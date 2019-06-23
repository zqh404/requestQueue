function Queue(options) {
    let _t = this

    _t.list = []
    _t.index = 0
    _t.limit = options.limit || 3
    _t.count = 0
    _t.requests = options.requests || 3
}

Queue.prototype = {
    add: function (element) {
        let _t = this

        if (_t.count > _t.requests || _t.count < 0) {
            return _t.clear()
        }

        _t.list.push(element)

        _t.count++

        console.log(element, ' 进入队列, 计数:', _t.count)

        if (_t.count === _t.requests) {
            _t.index = _t.limit - 1

            console.log('开始运行队列')

            _t.run()
        }
    },
    clear: function () {
        let _t = this

        _t.list = []
        _t.index = 0
        _t.count = 0
    },

    run: function () {
        let _t = this

        for (let i = 0; i < _t.limit; i++) {
            _t.list[i].then(res => {
                typeof res === 'function' ? res().then(() => {
                    _t.deal(i, res)
                }) : _t.deal(i, res)
            }).catch(err => {
                _t.deal(i, err)
            })
        }
    },

    deal: function (idx, res) {
        let _t = this
        // _t.list[idx] = null
        _t.count--
        _t.index++
        console.log(`输出结果: ${res}, 出队, 下一个进队: ${_t.index}, 计数为:${_t.count}`)
        _t.next(_t.index)
    },

    next: function (_index) {
        let _t = this

        //递归循环退出条件
        if (_index >= _t.list.length || !_t.list[_index]) {
            if (_t.count === 0) {
                console.log('异步请求队列运行结束')
                return _t.clear()
            }
            return
        }

        _t.list[_index].then((res, _idx = _index) => {
            typeof res === 'function' ? res().then(() => {
                _t.deal(_idx, res)
            }) : _t.deal(_idx, res)
        }).catch((err, _idx = _index) => {
            _t.deal(_idx, err)
        })

    }
}