
"use client";

import React, { useState, useEffect } from 'react';
import { Plus, Calendar, TrendingUp, Target, BookOpen, Award, ChevronRight, ChevronLeft, LogOut, Trash2 } from 'lucide-react';
import { db, auth } from '../firebase/config';
import { collection, onSnapshot, addDoc, doc, updateDoc, arrayUnion, query, where, deleteDoc } from 'firebase/firestore';
import { User, signOut } from 'firebase/auth';

// Define the shape of our data for TypeScript
interface Entry { id: number; date: string; hours: string; notes: string; }
interface Skill { id: string; name: string; category: string; targetHours: number; color: string; entries: Entry[]; userId: string; }

// Helper function to get today's date in the user's local timezone
const getTodayLocalISOString = () => { const date = new Date(); const year = date.getFullYear(); const month = (date.getMonth() + 1).toString().padStart(2, '0'); const day = date.getDate().toString().padStart(2, '0'); return `${year}-${month}-${day}`; };

const ProgressTracker = ({ user }: { user: User }) => {
  const [skills, setSkills] = useState<Skill[]>([]);
  const [selectedSkill, setSelectedSkill] = useState<Skill | null>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showAddSkill, setShowAddSkill] = useState(false);
  const [showAddEntry, setShowAddEntry] = useState(false);
  const [currentDate, setCurrentDate] = useState(new Date());
  // New vibrant and light color palette
  const [newSkill, setNewSkill] = useState({ name: '', category: '', targetHours: 1, color: 'bg-teal-400' });
  const [newEntry, setNewEntry] = useState({ hours: '', notes: '', date: getTodayLocalISOString() });

  const colors = ['bg-teal-400', 'bg-cyan-400', 'bg-sky-400', 'bg-indigo-400', 'bg-purple-400', 'bg-fuchsia-400', 'bg-pink-400', 'bg-rose-400'];

  useEffect(() => { if (!user) return; const skillsQuery = query(collection(db, 'skills'), where("userId", "==", user.uid)); const unsubscribe = onSnapshot(skillsQuery, (snapshot) => { setSkills(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Skill))); }); return () => unsubscribe(); }, [user]);
  
  const addSkill = async () => { if (newSkill.name && newSkill.category) { await addDoc(collection(db, 'skills'), { ...newSkill, userId: user.uid, entries: [] }); setNewSkill({ name: '', category: '', targetHours: 1, color: 'bg-teal-400' }); setShowAddSkill(false); } };
  const addEntry = async () => { if (selectedSkill && newEntry.hours && newEntry.notes) { const skillDocRef = doc(db, 'skills', selectedSkill.id); const entryWithId = { ...newEntry, id: Date.now() }; await updateDoc(skillDocRef, { entries: arrayUnion(entryWithId) }); setNewEntry({ hours: '', notes: '', date: getTodayLocalISOString() }); setShowAddEntry(false); setSelectedSkill(null); } };
  const deleteSkill = async (skillId: string) => { if (window.confirm("Are you sure you want to delete this skill and all its entries? This cannot be undone.")) { try { await deleteDoc(doc(db, 'skills', skillId)); } catch (error) { console.error("Error deleting skill: ", error); } } };
  const handleLogout = () => { signOut(auth); };
  
  const parseLocalDate = (dateString: string) => new Date(dateString + 'T00:00:00');
  const getTotalHours = (skill: Skill) => (skill.entries || []).reduce((total, entry) => total + parseFloat(entry.hours || "0"), 0);
  const getWeekProgress = (skill: Skill) => { const weekEntries = (skill.entries || []).filter(entry => { const entryDate = parseLocalDate(entry.date); const weekAgo = new Date(); weekAgo.setHours(0, 0, 0, 0); weekAgo.setDate(weekAgo.getDate() - 7); return entryDate >= weekAgo; }); return weekEntries.reduce((total, entry) => total + parseFloat(entry.hours || "0"), 0); };
  const getDayEntries = (date: Date) => { const dateStr = `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, '0')}-${date.getDate().toString().padStart(2, '0')}`; const dayEntries: (Entry & { skillName: string, skillColor: string })[] = []; skills.forEach(skill => { const entries = (skill.entries || []).filter(entry => entry.date === dateStr); entries.forEach(entry => dayEntries.push({ ...entry, skillName: skill.name, skillColor: skill.color })); }); return dayEntries; };
  const getDayTotalHours = (date: Date) => getDayEntries(date).reduce((total, entry) => total + parseFloat(entry.hours || "0"), 0);
  const generateCalendarDays = () => { const year = currentDate.getFullYear(); const month = currentDate.getMonth(); const firstDay = new Date(year, month, 1); const lastDay = new Date(year, month + 1, 0); const daysInMonth = lastDay.getDate(); const startingDayOfWeek = firstDay.getDay(); const days: { date: Date, isCurrentMonth: boolean }[] = []; const prevMonth = new Date(year, month - 1, 0); for (let i = startingDayOfWeek - 1; i >= 0; i--) { days.push({ date: new Date(year, month - 1, prevMonth.getDate() - i), isCurrentMonth: false }); } for (let day = 1; day <= daysInMonth; day++) { days.push({ date: new Date(year, month, day), isCurrentMonth: true }); } const remainingDays = 42 - days.length; for (let day = 1; day <= remainingDays; day++) { days.push({ date: new Date(year, month + 1, day), isCurrentMonth: false }); } return days; };
  const navigateMonth = (direction: number) => { const newDate = new Date(currentDate); newDate.setMonth(currentDate.getMonth() + direction); setCurrentDate(newDate); };
  const isToday = (date: Date) => new Date().toDateString() === date.toDateString();
  const TabButton = ({ id, icon: Icon, label, isActive, onClick }: { id: string, icon: React.ElementType, label: string, isActive: boolean, onClick: (id: string) => void }) => ( <button onClick={() => onClick(id)} className={`flex items-center gap-3 px-6 py-3 font-semibold transition-all duration-300 rounded-full text-sm ${ isActive ? 'bg-gradient-to-r from-sky-500 to-indigo-500 text-white shadow-lg' : 'bg-white bg-opacity-60 text-gray-700 hover:bg-opacity-100 hover:text-sky-600' }`}><Icon size={16} /><span>{label}</span></button> );
  
  const SkillCard = ({ skill }: { skill: Skill }) => ( 
    <div className="glass-card p-6 group relative overflow-hidden">
      <div className={`absolute top-0 left-0 h-1 w-full bg-gradient-to-r from-transparent via-${skill.color.split('-')[1]}-400 to-transparent transition-all duration-500 transform -translate-x-full group-hover:translate-x-0`}></div>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-3 h-3 rounded-full ${skill.color}`}></div>
          <h3 className="font-bold text-lg text-gray-800">{skill.name}</h3>
        </div>
        <button onClick={(e) => { e.stopPropagation(); deleteSkill(skill.id); }} className="absolute top-4 right-4 p-2 bg-red-100 text-red-500 rounded-full opacity-0 group-hover:opacity-100 hover:bg-red-200 transition-all duration-300" title="Delete Skill"><Trash2 size={16} /></button>
      </div>
      <div onClick={() => { setSelectedSkill(skill); setShowAddEntry(true); }} className="cursor-pointer">
        <span className="text-xs font-semibold text-gray-500 bg-gray-100 bg-opacity-50 px-3 py-1 rounded-full mb-4 inline-block">{skill.category}</span>
        <div className="space-y-3">
          <div className="flex justify-between items-center"><span className="text-sm text-gray-600">Total Hours</span><span className="font-bold text-xl text-gray-800">{getTotalHours(skill).toFixed(1)}h</span></div>
          <div className="flex justify-between items-center"><span className="text-sm text-gray-600">This Week</span><span className="font-semibold text-teal-600">{getWeekProgress(skill).toFixed(1)}h</span></div>
          <div className="bg-gray-200 bg-opacity-70 rounded-full h-2.5 overflow-hidden"><div className={`h-full ${skill.color} transition-all duration-500`} style={{ width: `${Math.min((getTotalHours(skill) / (skill.targetHours * 7)) * 100, 100)}%` }}></div></div>
          <div className="text-xs text-gray-500 text-center">Daily Goal: {skill.targetHours}h</div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen">
      <header className="glass-card m-4 p-4 md:m-8 md:p-6">
        <div className="flex items-center justify-between">
            <div><h1 className="text-3xl font-bold text-gray-800 mb-1">Skill Chisel</h1><p className="text-gray-600">Shape your skills, one day at a time.</p></div>
            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block"><div className="font-semibold text-gray-700">{user.email}</div><div className="text-sm text-gray-500">Welcome!</div></div>
                <button onClick={handleLogout} className="p-3 bg-red-100 text-red-500 rounded-full hover:bg-red-200 transition-colors" title="Logout"><LogOut size={20} /></button>
            </div>
        </div>
      </header>
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-4">
        <div className="flex gap-2 sm:gap-4 mb-8 overflow-x-auto pb-2"><TabButton id="overview" icon={Target} label="Overview" isActive={activeTab === 'overview'} onClick={setActiveTab} /><TabButton id="skills" icon={BookOpen} label="Skills" isActive={activeTab === 'skills'} onClick={setActiveTab} /><TabButton id="progress" icon={TrendingUp} label="Progress" isActive={activeTab === 'progress'} onClick={setActiveTab} /><TabButton id="calendar" icon={Calendar} label="Calendar" isActive={activeTab === 'calendar'} onClick={setActiveTab} /></div>
        
        {activeTab === 'overview' && (<div className="space-y-8"><div className="grid grid-cols-1 md:grid-cols-3 gap-6"><div className="glass-card p-6 text-center"><Award className="mx-auto mb-2 text-indigo-500" size={32} /><div className="text-3xl font-bold text-gray-800">{skills.length}</div><div className="text-gray-600">Active Skills</div></div><div className="glass-card p-6 text-center"><TrendingUp className="mx-auto mb-2 text-teal-500" size={32} /><div className="text-3xl font-bold text-gray-800">{skills.reduce((total, skill) => total + getWeekProgress(skill), 0).toFixed(1)}h</div><div className="text-gray-600">This Week</div></div><div className="glass-card p-6 text-center"><Calendar className="mx-auto mb-2 text-sky-500" size={32} /><div className="text-3xl font-bold text-gray-800">{skills.reduce((total, skill) => total + getTotalHours(skill), 0).toFixed(1)}h</div><div className="text-gray-600">Total Hours</div></div></div><div><h2 className="text-2xl font-bold text-gray-800 mb-6">Your Skills</h2><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{skills.map(skill => <SkillCard key={skill.id} skill={skill} />)}<button onClick={() => setShowAddSkill(true)} className="glass-card p-6 border-2 border-dashed border-gray-400 border-opacity-50 hover:border-sky-400 transition-all duration-300 flex items-center justify-center flex-col gap-3 text-gray-600 hover:text-sky-600"><Plus size={32} /><span className="font-semibold">Add New Skill</span></button></div></div></div>)}
        {activeTab === 'skills' && (<div className="space-y-6"><div className="flex justify-between items-center"><h2 className="text-2xl font-bold text-gray-800">Manage All Skills</h2><button onClick={() => setShowAddSkill(true)} className="bg-gradient-to-r from-sky-500 to-indigo-500 text-white px-6 py-3 rounded-full font-semibold flex items-center gap-2 hover:shadow-lg transition-all duration-300"><Plus size={16} /><span>Add Skill</span></button></div><div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">{skills.map(skill => <SkillCard key={skill.id} skill={skill} />)}</div></div>)}
        {activeTab === 'progress' && (<div className="space-y-6"><h2 className="text-2xl font-bold text-gray-800">Progress Log</h2><div className="glass-card p-4 sm:p-6"><div className="space-y-4">{skills.flatMap(skill => (skill.entries || []).map(entry => ({...entry, skillName: skill.name, skillColor: skill.color}))).sort((a,b) => parseLocalDate(b.date).getTime() - parseLocalDate(a.date).getTime()).map(entry => (<div key={entry.id} className="p-4 bg-white bg-opacity-60 rounded-lg"><div className="flex justify-between items-start mb-1"><div className="flex items-center gap-2"><div className={`w-3 h-3 rounded-full ${entry.skillColor}`}></div><span className="font-semibold text-gray-800">{entry.skillName}</span><span className="text-xs text-gray-500">({entry.date})</span></div><span className="text-sky-600 font-semibold">{entry.hours}h</span></div><p className="text-gray-700 text-sm pl-5">{entry.notes}</p></div>))}</div></div></div>)}
        
        {activeTab === 'calendar' && (<div className="glass-card p-4 sm:p-6">
            <div className="flex items-center justify-between mb-4">
                <h2 className="text-2xl font-bold text-gray-800">{currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}</h2>
                <div className="flex items-center gap-2">
                    <button onClick={() => navigateMonth(-1)} className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"><ChevronLeft size={20} /></button>
                    <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-white hover:bg-opacity-50 rounded-lg transition-colors"><ChevronRight size={20} /></button>
                </div>
            </div>
            <div className="grid grid-cols-7 bg-white bg-opacity-30 rounded-t-lg">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map(day => <div key={day} className="p-2 text-center font-semibold text-gray-600 text-sm">{day}</div>)}
            </div>
            <div className="grid grid-cols-7 grid-rows-6">{generateCalendarDays().map((dayObj, index) => { const dayEntries = getDayEntries(dayObj.date); const totalHours = getDayTotalHours(dayObj.date); return (<div key={index} className={`p-2 h-24 border-r border-b border-white border-opacity-20 ${!dayObj.isCurrentMonth ? 'bg-gray-50 bg-opacity-20' : ''} ${isToday(dayObj.date) ? 'bg-sky-100 bg-opacity-70' : ''}`}><div className={`text-sm font-semibold mb-1 ${!dayObj.isCurrentMonth ? 'text-gray-400' : isToday(dayObj.date) ? 'text-sky-600' : 'text-gray-700'}`}>{dayObj.date.getDate()}</div>{totalHours > 0 && (<div className="space-y-1"><div className="text-xs font-bold text-center text-white bg-sky-500 rounded-full py-0.5">{totalHours.toFixed(1)}h</div></div>)}</div>); })}</div>
        </div>)}

        {/* --- MODALS with new glass style and visible text color --- */}
        {showAddSkill && (<div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div className="glass-card p-8 w-full max-w-md"><h3 className="text-2xl font-bold text-gray-800 mb-6">Create a New Skill</h3><div className="space-y-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Skill Name</label><input type="text" value={newSkill.name} onChange={(e) => setNewSkill({...newSkill, name: e.target.value})} className="w-full p-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl text-gray-900 focus:ring-2 focus:ring-sky-400" placeholder="e.g., Learn 3D Modeling"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Category</label><input type="text" value={newSkill.category} onChange={(e) => setNewSkill({...newSkill, category: e.target.value})} className="w-full p-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl text-gray-900 focus:ring-2 focus:ring-sky-400" placeholder="e.g., Creative"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Daily Goal (hours)</label><input type="number" step="0.5" min="0.5" value={newSkill.targetHours} onChange={(e) => setNewSkill({...newSkill, targetHours: parseFloat(e.target.value)})} className="w-full p-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl text-gray-900 focus:ring-2 focus:ring-sky-400"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Pick a Color</label><div className="flex gap-2 flex-wrap">{colors.map(color => <button key={color} onClick={() => setNewSkill({...newSkill, color})} className={`w-8 h-8 rounded-full ${color} transition-transform duration-200 hover:scale-110 ${newSkill.color === color ? 'ring-4 ring-offset-2 ring-sky-500' : ''}`} />)}</div></div></div><div className="flex gap-3 mt-8"><button onClick={() => setShowAddSkill(false)} className="flex-1 py-3 bg-white bg-opacity-80 rounded-xl font-semibold text-gray-700 hover:bg-opacity-100">Cancel</button><button onClick={addSkill} className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg">Add Skill</button></div></div></div>)}
        {showAddEntry && selectedSkill && (<div className="fixed inset-0 bg-black bg-opacity-60 backdrop-blur-sm flex items-center justify-center p-4 z-50"><div className="glass-card p-8 w-full max-w-md"><h3 className="text-2xl font-bold text-gray-800 mb-2">Log Your Progress</h3><p className="text-gray-600 mb-6">For: <span className="font-semibold">{selectedSkill.name}</span></p><div className="space-y-4"><div><label className="block text-sm font-semibold text-gray-700 mb-2">Date</label><input type="date" value={newEntry.date} onChange={(e) => setNewEntry({...newEntry, date: e.target.value})} className="w-full p-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl text-gray-900 focus:ring-2 focus:ring-sky-400"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Hours Practiced</label><input type="number" step="0.25" min="0" value={newEntry.hours} onChange={(e) => setNewEntry({...newEntry, hours: e.target.value})} className="w-full p-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl text-gray-900 focus:ring-2 focus:ring-sky-400" placeholder="1.5"/></div><div><label className="block text-sm font-semibold text-gray-700 mb-2">Notes</label><textarea value={newEntry.notes} onChange={(e) => setNewEntry({...newEntry, notes: e.target.value})} className="w-full p-3 bg-white bg-opacity-50 border border-white border-opacity-30 rounded-xl h-24 resize-none text-gray-900 focus:ring-2 focus:ring-sky-400" placeholder="What did you work on today?"/></div></div><div className="flex gap-3 mt-8"><button onClick={() => { setShowAddEntry(false); setSelectedSkill(null); }} className="flex-1 py-3 bg-white bg-opacity-80 rounded-xl font-semibold text-gray-700 hover:bg-opacity-100">Cancel</button><button onClick={addEntry} className="flex-1 py-3 bg-gradient-to-r from-sky-500 to-indigo-500 text-white rounded-xl font-semibold hover:shadow-lg">Save Entry</button></div></div></div>)}
      </main>
    </div>
  );
};

export default ProgressTracker;