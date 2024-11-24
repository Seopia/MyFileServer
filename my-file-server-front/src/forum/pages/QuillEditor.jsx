import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import 'react-quill/dist/quill.snow.css'; // 기본 테마
import './QuillEditor.css';

import api from "../../common/api";

const QuillEditor = ({newForum, setNewForum}) => {


  const [content, setContent] = useState();
  const quillRef = useRef(null);




  const modules = {
    toolbar: [

      [{ header: [1, 2, 3, 4, false] }],
      ['bold', 'italic', 'underline'],
      ['blockquote', 'code-block', 'image'],
      [{ color: [] }, { align: [] }],
      [{ size: ['small', false, 'large', 'huge'] }],
    ],
  }



  useEffect(() => {

    const handleImage = ()=> {

      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();
      input.onchange = async () => {
        
        const file = input.files[0];
        // const {getEditor} = quillRef.current;
        const range = quillRef.current.getEditor().getSelection(true);

        try {
          const {data} = await api.post('/forum/image', {file:file}); 
          const url = `http://${process.env.REACT_APP_IP}/download/${data}`;
          console.log("upload ", url);
          
          quillRef.current.getEditor().insertEmbed(range.index, "image", url);
        } catch (e) {
          console.log(e);
          
        }
      };
    }

    if(quillRef.current){
        
      const toolbar = quillRef.current.getEditor().getModule("toolbar");
      toolbar.addHandler("image", handleImage);

    }
  }, [])





    return (
      <ReactQuill
      style={{ overflowY: "unset" }}
      modules={modules}
      ref={quillRef}
      onChange={(value) => setNewForum((prev) => ({
          ...prev,
          content: value
      }))}
      value={newForum.content}
      />
    );

}

export default QuillEditor;
