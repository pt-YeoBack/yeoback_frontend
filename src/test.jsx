import { useState } from "react"
import { useToast } from "./utils/ToastContext"

const Test = () => {
    const { showToast } = useToast();
    const [ text, setText ] = useState("");

    const handleInput = (e) => {
        const value = e.target.value;
        setText(value);
        console.log(text);
    }

    const viewToast = () => {
        if(text) {
            showToast(text, "success");
        } else {
            showToast("값을 입력해주세요");
        }
    }

    return (
        <>
        <main>
            <input type="text" placeholder="토스트 내용 입력" onChange={handleInput}/>
            <button type="button" onClick={viewToast}>
                입력
            </button>
        </main>
        </>
    );
}

export default Test;