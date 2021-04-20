const fetch = require('node-fetch')

exports.sleep = async(ms) => {
    return new Promise(resolve => setTimeout(resolve, ms));
}

exports.parseMarkdown = async(text) => {
    text = text.replace(/(\[[^\][]*]\(http[^()]*\))|[_*[\]()~>#+=|{}.!-]/gi, (x, y) => y ? y : '\\' + x)
    return text
}

exports.fetchJson = fetchJson = (url, options) => new Promise(async(resolve, reject) => {
    fetch(url, options)
        .then(response => response.json())
        .then(json => {
            resolve(json)
        })
        .catch((err) => {
            reject(err)
        })
})

exports.range = function range(start, stop, step) {
    if (typeof stop == 'undefined') {
        // one param defined
        stop = start;
        start = 0;
    }
    if (typeof step == 'undefined') {
        step = 1;
    }
    if ((step > 0 && start >= stop) || (step < 0 && start <= stop)) {
        return [];
    }
    var result = [];
    for (var i = start; step > 0 ? i < stop : i > stop; i += step) {
        result.push(i);
    }
    return result;
}

exports.kyun = function kyun(seconds){
    function pad(s){
      return (s < 10 ? '0' : '') + s;
    }
    var hours = Math.floor(seconds / (60*60));
    var minutes = Math.floor(seconds % (60*60) / 60);
    var seconds = Math.floor(seconds % 60);
    
    return `${pad(hours)}H ${pad(minutes)}M ${pad(seconds)}S`
}

exports.tanggal = function tanggal(){
    myMonths = ["Januari","Februari","Maret","April","Mei","Juni","Juli","Agustus","September","Oktober","November","Desember"];
                myDays = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
                var tgl = new Date();
                var day = tgl.getDate()
                bulan = tgl.getMonth()
                var thisDay = tgl.getDay(),
                thisDay = myDays[thisDay];
                var yy = tgl.getYear()
                var year = (yy < 1000) ? yy + 1900 : yy;
                return `${thisDay}, ${day} ${myMonths[bulan]} ${year}`
    }