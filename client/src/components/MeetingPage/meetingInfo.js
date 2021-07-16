import react from 'react'
import CloseIcon from "@material-ui/icons/Close";
import PersonIcon from "@material-ui/icons/Person";
import FileCopyIcon from "@material-ui/icons/FileCopy";
import SecuritySharpIcon from "@material-ui/icons/SecuritySharp";

function MeetingInfo({ url, setMeetingInfoPopUp }) {
 
   

  return (
    <div class="meeting-info-block">
      <div class="meeting-header">
        <h3>Your Meeting's ready</h3>
        <CloseIcon onClick={()=>{setMeetingInfoPopUp(false)}} />
      </div>
      <button class="add-people-btn">
        <PersonIcon />
        Add others
      </button>
      <p class="info-text">
        Or share this meeting link with others you want in the meeting
      </p>
      <div class="meet-link">
        <span>{url}</span>
        <FileCopyIcon  onClick={()=>{navigator.clipboard.writeText(url)}}/>
      </div>
      <div class="permission-text">
        <SecuritySharpIcon />
        <p class="small-text">
          People who use this meeting link must get your permission before they
          can join.
        </p>
      </div>
      <p class="small-text">Joined as xyz@gmail.com</p>
    </div>
    //   )}
  );
}

export default MeetingInfo