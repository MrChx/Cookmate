export default function AdminSettings() {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-10">
        <h1 className="text-2xl font-bold text-gray-900 tracking-tight">Settings</h1>
        <p className="text-gray-500">Manage system preferences and profile</p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
         <h2 className="text-lg font-bold text-gray-900 mb-6">Profile Settings</h2>
         
         <div className="space-y-6">
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
               <input disabled value="admin@cookmate.com" className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-gray-500" />
            </div>
            <div>
               <label className="block text-sm font-medium text-gray-700 mb-2">Change Password</label>
               <input type="password" placeholder="Enter new password" className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-orange-500 focus:border-orange-500" />
            </div>
            
            <button className="bg-orange-500 text-white px-6 py-2.5 rounded-lg text-sm font-bold hover:bg-orange-600 transition">
               Save Changes
            </button>
         </div>
      </div>
    </div>
  );
}
