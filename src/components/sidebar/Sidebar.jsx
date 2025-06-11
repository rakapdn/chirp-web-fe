import { RssFeed, ChatBubbleOutline, GroupAddOutlined, PlayCircleFilled, Bookmark, HelpOutline, WorkOutline, Event, School } from "@material-ui/icons";

export default function Sidebar() {
  return (
    <aside className="hidden lg:block w-72 p-6 sticky top-20 h-screen overflow-y-auto bg-white/70 backdrop-blur-xl rounded-2xl shadow-xl shadow-blue-500/10 border border-white/20">
      <div className="space-y-6">
        <div className="space-y-4">
          <h3 className="font-bold text-gray-800 text-lg">Menu</h3>
          <ul className="space-y-2">
            {[
              { icon: <RssFeed />, text: "-" },
              { icon: <ChatBubbleOutline />, text: "-" },
              { icon: <PlayCircleFilled />, text: "-" },
              { icon: <GroupAddOutlined />, text: "-" },
              { icon: <Bookmark />, text: "-" },
              { icon: <HelpOutline />, text: "-" },
              { icon: <WorkOutline />, text: "-" },
              { icon: <Event />, text: "-" },
              { icon: <School />, text: "-" },
            ].map((item, index) => (
              <li key={index} className="flex items-center space-x-3 text-gray-600 hover:text-blue-600 cursor-pointer transition-colors">
                <span className="text-lg">{item.icon}</span>
                <span>{item.text}</span>
              </li>
            ))}
          </ul>
          <button className="w-full bg-gradient-to-r from-blue-500 to-purple-500 text-white py-2 rounded-full font-semibold hover:shadow-lg hover:shadow-blue-500/25 transition-all duration-300">
            Show More
          </button>
        </div>
        <div>
          <h3 className="font-bold text-gray-800 text-lg">Friends</h3>
          <ul className="space-y-2 mt-2">
            {[
              "/assets/peter.jpeg",
              "/assets/shang.jpeg",
              "/assets/thorr.jpeg",
              "/assets/strange.jpeg",
              "/assets/hulk.jpeg",
            ].map((img, index) => (
              <li key={index} className="flex items-center space-x-3">
                <img src={img} alt="" className="w-8 h-8 rounded-full object-cover" />
                <span className="text-gray-600">Friend {index + 1}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </aside>
  );
}