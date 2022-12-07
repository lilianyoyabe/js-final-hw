let orderData = [];
const orderList = document.querySelector(".js-orderList");

function init(){
    getOrderList();
}
init();


function renderC3_lv2(){
    //物件資料搜集
    let obj = {};
    orderData.forEach(function(item){
        item.products.forEach(function(productItem){
            if(obj[productItem.title]==undefined){
                obj[productItem.title] = productItem.price*productItem.quantity;
            }else{
                obj[productItem.title] += productItem.price*productItem.quantity;
            }
        })
    })
    console.log(obj);
    //做出資料關聯
    let originAry = Object.keys(obj);
    console.log(originAry);
    //透過originAry整理成C3
    let rankSortAry = [];
    originAry.forEach(function(item){
        let ary= [];
        ary.push(item);
        ary.push(obj[item]);
        rankSortAry.push(ary);
    });
    console.log(rankSortAry);
    //比大小
    rankSortAry.sort(function(a,b){
        return b[1]-a[1];
    });
    //超過四筆統整為其他
    if (rankSortAry.length >3){
        let otherTotal = 0;
        rankSortAry.forEach(function(item,index){
            if(index>2){
                otherTotal += rankSortAry[index][1];
            }
        })
        rankSortAry.splice(3,rankSortAry.length-1);
        rankSortAry.push(['其他',otherTotal]);
    }
    //C3圖表
    c3.generate({
        bindto: '#chart', 
        data: {
            type: "pie",
            columns: rankSortAry,
            },
            color:{
                pattern : ['#301E5F' , '#5434A7' ,'#9D7FEA' ,'#DACBFF']
        }
    });
    };



function getOrderList(){
    axios.get('https://livejs-api.hexschool.io/api/livejs/v1/admin/yubaozi/orders',{
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        orderData = response.data.orders;
        //組訂單字串

        let str = "";
        orderData.forEach(function(item){
            //組時間狀態
            const timeStamp = new Date(item.createdAt*1000);
            const orderTime = `${timeStamp.getFullYear()}/${timeStamp.getMonth()+1}/${timeStamp.getDate()}`;
            //組產品字串
            let productStr="";
            item.products.forEach(function(productItem){
                productStr += `<p>${productItem.title} x ${productItem.quantity}</p>`
            })
            //判斷訂單處理狀態
            let orderStatus="";
            if(item.paid==true){
                orderStatus="已處理";
            }else{
                orderStatus="未處理";
            }
            //組訂單字串
            str +=  `<tr>
            <td>${item.id}</td>
            <td>
            <p>${item.user.name}</p>
            <p>${item.user.tel}</p>
            </td>
            <td>${item.user.address}</td>
            <td>${item.user.email}</td>
            <td>
            <p>${productStr}</p>
            </td>
            <td>${orderTime}</td>
            <td class="js-orderStatus">
            <a href="#" data-status="${item.paid}" class ="orderStatus" data-id="${item.id}">${orderStatus}</a>
            </td>
            <td>
            <input type="button" class="delSingleOrder-Btn js-orderDelete" data-id="${item.id}" value="刪除">
            </td>
        </tr>`
        })
        orderList.innerHTML = str;
        renderC3_lv2();
    })
}

//處理未處理跟刪除
orderList.addEventListener("click",function(e){
    let id = e.target.getAttribute("data-id");
    let status = e.target.getAttribute("data-status");
    e.preventDefault();
    const targetClass = e.target.getAttribute("class");
    console.log(targetClass);
    if(targetClass == "delSingleOrder-Btn js-orderDelete"){
        deleteOrderItem(id);
        return;}
    if(targetClass == "orderStatus"){
        changeOrderStatusItem(status,id)
        return;
    }
    
})

function changeOrderStatusItem(status,id){
    console.log(status,id);
    let newStatus;
    if(status==true){
        newStatus=false;
    }else{
        newStatus=true;
    }
    axios.put(`https://livejs-api.hexschool.io/api/livejs/v1/admin/yubaozi/orders`,
    {
        "data": {
            "id": id,
            "paid": newStatus
          }
    },{
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        alert('刪除成功');
        getOrderList();
    })
};

function deleteOrderItem(id){
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/yubaozi/orders/${id}`,{
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        alert('刪除該筆訂單成功！');
        getOrderList();
    })
};

//處理刪除全部的按鈕
const discardAllBtn = document.querySelector(".discardAllBtn");
discardAllBtn.addEventListener("click",function(e){
    e.preventDefault();
    axios.delete(`https://livejs-api.hexschool.io/api/livejs/v1/admin/yubaozi/orders`,{
        headers:{
            'Authorization': token,
        }
    })
    .then(function(response){
        alert('刪除全部訂單成功！');
        getOrderList();
    })
})


