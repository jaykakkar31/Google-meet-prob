import react from "react";
import ClosedCaptionIcon from "@material-ui/icons/ClosedCaption";
import DesktopWindowsIcon from "@material-ui/icons/DesktopWindows";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import MicIcon from "@material-ui/icons/Mic";
import PhoneEnabledIcon from "@material-ui/icons/PhoneEnabled";
import VideocamIcon from "@material-ui/icons/Videocam";

function MeetingFooter({ screenShare, isPresenting, stopScreenShare }) {
	return (
		<div className="footer-item">
			<div className="left-item">
				<div className="item-block">
					Meeting Details
					<ExpandLessIcon />
				</div>
			</div>
			<div className="center-item">
				<div className="icon-block mic">
					<MicIcon />
				</div>
				<div className="icon-block phone">
					<PhoneEnabledIcon />
				</div>
				<div className="icon-block video">
					<VideocamIcon />
				</div>
			</div>
			<div className="right-item">
				<div className="icon-block ">
					<ClosedCaptionIcon />
					<p className="title">Turn on captions</p>
				</div>
				{isPresenting ? (
					<div
						className="icon-block screen-share"
						onClick={() => {
							stopScreenShare();
						}}
					>
						<DesktopWindowsIcon />
						<p className="title">Stop Presenting</p>
					</div>
				) : (
					<div
						className="icon-block screen-share"
						onClick={() => {
							screenShare();
						}}
					>
						<DesktopWindowsIcon />
						<p className="title">Present now</p>
					</div>
				)}
			</div>
		</div>
	);
}

export default MeetingFooter;
