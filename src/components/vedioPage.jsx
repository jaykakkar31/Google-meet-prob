import react from "react"
import PeopleIcon from '@material-ui/icons/People';
import ChatBubbleSharpIcon from '@material-ui/icons/ChatBubbleSharp';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import ClosedCaptionIcon from '@material-ui/icons/ClosedCaption';
import DesktopWindowsIcon from '@material-ui/icons/DesktopWindows';
import ExpandLessIcon from '@material-ui/icons/ExpandLess';
import MicIcon from '@material-ui/icons/Mic';
import CallIcon from '@material-ui/icons/Call';
import VideocamIcon from '@material-ui/icons/Videocam';
import CloseIcon from '@material-ui/icons/Close';
import PersonIcon from '@material-ui/icons/Person';
import FileCopyIcon from '@material-ui/icons/FileCopy';
import SecuritySharpIcon from '@material-ui/icons/SecuritySharp';


function VideoPage(){
    return(
        <div class="videoScreen">     
            <video class="video-container" controls></video>
            <div class="frame-header">
                <div class="header-items icon-block">
                    <PeopleIcon/>
                </div>
                <div class="header-items icon-block">
                    <ChatBubbleSharpIcon/>
                </div>
                <div class="header-items date-block">
                    3:10AM
                </div>
                <div class="header-items icon-block">
                    <AccountCircleIcon/>
                </div>
            </div>
            <div class="footer-item">
                <div class="left-item">
                    <div class="item-block">Meeting Details<ExpandLessIcon/></div>
                </div>
                <div class="center-item">
                   <div class="icon-block"><MicIcon/></div>
                   <div class="icon-block"><CallIcon/></div>
                    <div class="icon-block"><VideocamIcon/></div>
                </div>
                <div class="right-item">
                    <div class="icon-block"><ClosedCaptionIcon/>
                    <p class="title">Turn on captions</p></div>
                    <div class="icon-block"><DesktopWindowsIcon/>
                    <p class="title">Present now</p></div>
                </div>
            </div> 
            <div class="meeting-info-block">
                <div class="meeting-header">
                    <h3>Your Meeting's ready</h3>
                    <CloseIcon/>
                </div>    
                <button class="add-people-btn">
                    <PersonIcon/>
                     Add others
                </button>
                <p class="info-text">Or share this meeting link with others you want in the meeting</p>
                <div class="meet-link">
                    <span>http://localhost</span>
                    <FileCopyIcon/>
                </div>
                <div class="permission-text">
                    <SecuritySharpIcon/>
                <p class="small-text">People who use this meeting link must get your permission before they can join.</p>
                </div>
                <p class="small-text">Joined as akshay@gmail.com</p>
            </div>  
        </div>
    )
}

export default VideoPage