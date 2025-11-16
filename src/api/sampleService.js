


export async function loadRefSeq(loadType){
}

export async function uploadSample(sampleConfig){

    return new Promise((res)=>{
        setTimeout(()=>{
            res({
                ok:(Math.random()*10)>5,
                errorMsg: "test"
            })
        }, 2000)
    })
}