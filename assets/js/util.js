const copyList = (arr) => {
    return arr.map((e)=>{
        if(typeof e === 'object'){
            return Object.assign({},e)
        }else{
            return e
        }
    })
}

function getNowFormatDate() {
    var date = new Date();
    var year = date.getFullYear();
    var month = date.getMonth() + 1;
    var strDate = date.getDate();
    var hours = date.getHours();
    var min = date.getMinutes();
    var seconds = date.getSeconds();

    if (month >= 1 && month <= 9) {
        month = '0' + month;
    }
    if (strDate >= 0 && strDate <= 9) {
        strDate = '0' + strDate;
    }
    if (hours >= 1 && hours <= 9) {
        hours = '0' + hours;
    }
    if (min >= 0 && min <= 9) {
        min = '0' + min;
    }
    if (seconds >= 0 && seconds <= 9) {
        seconds = '0' + seconds;
    }

    var currentdate = year + '-' + month + '-' + strDate + 'T' + hours + ':' + min + ':' + seconds + '.000Z';
    return currentdate;
}

export {
    copyList,
    getNowFormatDate
}
