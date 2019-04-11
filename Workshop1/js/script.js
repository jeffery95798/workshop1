var bookDataFromLocalStorage = [];
// 載入書籍資料

function loadBookData() {
    bookDataFromLocalStorage = JSON.parse(localStorage.getItem('bookData'));
    if (bookDataFromLocalStorage == null) {
        bookDataFromLocalStorage = bookData;
        localStorage.setItem('bookData', JSON.stringify(bookDataFromLocalStorage));
    }
    Grid(bookDataFromLocalStorage);
}

//將資料放入grid內
function Grid(data) {
    $("#book_grid").kendoGrid({
        dataSource: {//資料來源
            type: "odata",
            data: data,
            pageSize: 20,
        },
        height: 550,
        toolbar: kendo.template($("#template").html()), //查詢textbox
        pageable: {//分頁選單
            input: true,
            numeric: false
        },
        columns: [
            {command: [//刪除按紐
                    {name: "刪除", click: function (e) {
                            e.preventDefault();
                            var tr = $(e.target).closest("tr");
                            var data = this.dataItem(tr);
                            kendo.confirm("確定刪除「" + data.BookName + "」嗎?").then(function () {
                                bookDataFromLocalStorage = JSON.parse(localStorage.getItem('bookData'));
                                n = 0;
                                for (var i = 0, max = bookDataFromLocalStorage.length; i < max; i++) {
                                    if (bookDataFromLocalStorage[i].BookId == data.BookId) {
                                        break;
                                    } else {
                                        n++
                                    }
                                }
                                bookDataFromLocalStorage.splice(n, 1);
                                localStorage.setItem('bookData', JSON.stringify(bookDataFromLocalStorage));
                                Grid(bookDataFromLocalStorage);
                            }, function () {
                            });
                        }
                    }
                ]},
            {field: "BookId", title: "書籍編號", },
            {field: "BookName", title: "書籍名稱", },
            {field: "BookCategory", title: "書籍種類", },
            {field: "BookAuthor", title: "作者", },
            {field: "BookBoughtDate", title: "購買日期", format: "{0: yyyy-MM-dd}"},
            {field: "BookDeliveredDate", title: "送達狀況",template: kendo.template($("#name-template").html())},
            
            {field: "BookPrice", title: "金額", format: "{0:0,0}", attributes: {style: "text-align: right;"}},
            {field: "BookAmount", title: "數量", format: "{0:N0}", attributes: {style: "text-align: right;"}},
            {field: "BookTotal", title: "總計", format: "{0:0,0元}", attributes: {style: "text-align: right;"}},
        ],
        editable: true,
    });
}

$(function () {
//載入loadBookData資料
    loadBookData();
//中文設定
    kendo.culture("zh-TW");
//建立的視窗
    $(add_book).click(function () {
        $("#window").data("kendoWindow").center().open();
    });
//建立視窗本體
    $("#window").kendoWindow({
        width: "600px",
        title: "新增書籍",
        visible: false,
        actions: [
            "Pin",
            "Minimize",
            "Maximize",
            "Close"
        ],
    });
//金額跟數量上升下降控制
    $("#book_price").kendoNumericTextBox({
        spin: onSpin
    });
    $("#book_amount").kendoNumericTextBox({
        spin: onSpin
    });
    function onSpin() {
        document.getElementById("book_total").innerHTML = $("#book_price").val() * $("#book_amount").val();
    }
//日期    
    $("#bought_datepicker").kendoDatePicker({
        parseFormats: ["yyyyMMdd", "yyyy/MM/dd", "yyyy-MM-dd"],
        value: new Date(),
        min: new Date(),
        format: "yyyy-MM-dd"
    });
    $("#delivered_datepicker").kendoDatePicker({
        parseFormats: ["yyyyMMdd", "yyyy/MM/dd", "yyyy-MM-dd"],
        min: new Date($("#bought_datepicker").val()),
        format: "yyyy-MM-dd"
    });
//下拉是選單與換圖片
    var viewModel = kendo.observable({
        imageSrc: null,
        bookCategoryList: [
            {name: "資料庫", url: "image/database.jpg"},
            {name: "網際網路", url: "image/internet.jpg"},
            {name: "應用系統整合", url: "image/system.jpg"},
            {name: "家庭保健", url: "image/home.jpg"},
            {name: "語言", url: "image/language.jpg"},
        ]
    });
    viewModel.imageSrc = viewModel.bookCategoryList[0].url;
    kendo.bind($("#window"), viewModel);
    var validator = $("#book_form").kendoValidator().data("kendoValidator");

//查詢
function find(str) {
    bookDataInquire = [];
    //空值顯示所有資料
    if (str == "") {
        bookDataInquire = JSON.parse(localStorage.getItem('bookData'));
    } else {
        bookDataFromLocalStorage = JSON.parse(localStorage.getItem('bookData'));
        for (var i = 0, max = bookDataFromLocalStorage.length; i < max; i++) {
            if (bookDataFromLocalStorage[i].BookName == str || bookDataFromLocalStorage[i].BookAuthor == str) {
                bookDataInquire.push(bookDataFromLocalStorage[i]);
            }
        }
    }
    Grid(bookDataInquire);
}
//新增
    $(save_book).click(function () {
        if (validator.validate()) {//條件為所有欄位都符合標準
            bookDataFromLocalStorage = JSON.parse(localStorage.getItem('bookData')); //下載loadBookData資料
            bookDataFromLocalStorage.push(//新增資料放入json中
                    {
                        "BookId": Date.now(), //因為沒有記錄流水號所以使用時間當ID
                        "BookCategory": viewModel.bookCategoryList[0].name,
                        "BookName": $("#book_name").val(),
                        "BookAuthor": $("#book_author").val(),
                        "BookBoughtDate": $("#bought_datepicker").val(),
                        "BookDeliveredDate": $("#delivered_datepicker").val(),
                        "BookPrice": $("#book_price").val(),
                        "BookAmount": $("#book_amount").val(),
                        "BookTotal": $("#book_price").val() * $("#book_amount").val()
                    }, );
            localStorage.setItem('bookData', JSON.stringify(bookDataFromLocalStorage)); //將所有json資料放入loadBookData
            Grid(bookDataFromLocalStorage);
            $("#window").data("kendoWindow").close();
        }
    });
}
);