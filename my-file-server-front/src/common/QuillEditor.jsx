import { useEffect, useMemo, useRef } from "react";
import ReactQuill from "react-quill";
import "react-quill/dist/quill.snow.css";
import "./QuillEditor.css";
import api from "./api";

const downloadBaseUrl = process.env.REACT_APP_IP + "/download";

const QuillEditor = ({
  newForum,
  setNewForum,
  placeholder = "작성해보세요 아무렇게나",
  publicFile = false,
  readOnly = false,
  editorHeight = 360,
}) => {
  const quillRef = useRef(null);

  const modules = useMemo(
    () => ({
      toolbar: [
        [{ header: [1, 2, 3, 4, false] }],
        ["bold", "italic", "underline", "strike"],
        ["blockquote", "code-block"],
        [{ list: "ordered" }, { list: "bullet" }],
        ["link", "image"],
        [{ color: [] }, { align: [] }],
        [{ size: ["small", false, "large", "huge"] }],
      ],
      clipboard: {
        matchVisual: false,
      },
    }),
    []
  );

  const formats = useMemo(
    () => [
      "header",
      "bold",
      "italic",
      "underline",
      "strike",
      "blockquote",
      "code-block",
      "list",
      "bullet",
      "link",
      "image",
      "color",
      "align",
      "size",
    ],
    []
  );

  useEffect(() => {
    const editor = quillRef.current?.getEditor();
    if (!editor) return;

    const uploadImageFile = async (file) => {
      const range = editor.getSelection(true) || { index: editor.getLength(), length: 0 };
      try {
        const formData = new FormData();
        formData.append("file", file);

        const url = publicFile ? "/public/image" : "/forum/image";
        const response = await api.post(url, formData);
        const savedFileName =
          typeof response.data === "string"
            ? response.data
            : response.data?.filename || response.data?.fileName || "";

        if (!savedFileName) {
          throw new Error("이미지 업로드 응답이 올바르지 않습니다.");
        }

        const imageUrl = `${downloadBaseUrl.replace(/\/$/, "")}/${savedFileName}`;
        editor.insertEmbed(range.index, "image", imageUrl);
        editor.insertText(range.index + 1, "\n");
        editor.setSelection(range.index + 2);
      } catch (error) {
        console.error("이미지 업로드 실패:", error);
      }
    };

    const handleImageUpload = () => {
      const input = document.createElement("input");
      input.setAttribute("type", "file");
      input.setAttribute("accept", "image/*");
      input.click();

      input.onchange = async () => {
        const file = input.files?.[0];
        if (!file) return;
        await uploadImageFile(file);
      };
    };

    const toolbar = editor.getModule("toolbar");
    toolbar.addHandler("image", handleImageUpload);

    const handleDrop = async (event) => {
      event.preventDefault();
      const dataTransfer = event.dataTransfer;
      if (!dataTransfer) return;

      const file = dataTransfer.files?.[0] || Array.from(dataTransfer.items || [])
        .map((item) => (item.kind === "file" ? item.getAsFile() : null))
        .find(Boolean);
      if (!file || !file.type.startsWith("image/")) return;

      await uploadImageFile(file);
    };

    const editorContainer = quillRef.current?.editor?.root?.parentNode;
    if (editorContainer) {
      editorContainer.addEventListener("dragover", (e) => e.preventDefault());
      editorContainer.addEventListener("drop", handleDrop);
    }

    return () => {
      if (editorContainer) {
        editorContainer.removeEventListener("drop", handleDrop);
      }
    };
  }, [publicFile]);

  const handleChange = (value) => {
    const content = value === "<p><br></p>" ? "" : value;
    setNewForum((prev) => ({
      ...prev,
      content,
    }));
  };

  return (
    <div className="quill-editor-wrapper" style={{ minHeight: editorHeight }}>
      <ReactQuill
        ref={quillRef}
        theme="snow"
        modules={modules}
        formats={formats}
        value={newForum?.content ?? ""}
        onChange={handleChange}
        placeholder={placeholder}
        readOnly={readOnly}
      />
    </div>
  );
};

export default QuillEditor;
