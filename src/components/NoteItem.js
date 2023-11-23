import React, { useContext } from "react";
import noteContext from "../context/notes/noteContext";

const NoteItem = (props) => {
  const context = useContext(noteContext);
  const { deleteNote } = context;
  const { note, updateNote } = props;

  return (
    <div className="col-md-3 mx-3 shadow p-3 mb-5 bg-white rounded">
      <div className="card my-3" style={{border : 0}}>
        <div className="card-body " style={{textAlign : 'center'}}>
          <div className="justify-content-center " style={{marginBottom:'8px'}}>
            <h5 className="card-title " style={{margin:'auto'}}>{note.title}</h5>
            <i
              className="fa-solid fa-trash-can " style={{margin : '0 2px'}}
              onClick={() => {
                deleteNote(note._id);
                props.showAlert("Deleted successfully" , "success")
              }}
            ></i>
            <i
              className="fa-solid fa-pen-to-square " style={{margin : '0 2px'}}
              onClick={() => {
                updateNote(note);
                
              }}
            ></i>
          </div>
          <p className="card-text"> {note.description}</p>
        </div>
      </div>
    </div>
  );
};

export default NoteItem;
