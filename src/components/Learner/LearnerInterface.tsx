import React, { useState } from'react';
import { BookOpen, Target, TrendingUp, Users, Play, Award, Settings } from'lucide-react';
import { useUserStore } from'../../store/userStore';

interface CourseCardProps {
 title: string;
 description: string;
 progress: number;
 skills: string[];
 instructor: string;
 onContinue: () => void;
}

const CourseCard: React.FC<CourseCardProps> = ({
 title,
 description,
 progress,
 skills,
 instructor,
 onContinue,
}) => (
 <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 hover:shadow-md transition-all duration-300">
  <div className="flex items-start justify-between mb-4">
   <div className="flex-1">
    <h3 className="text-lg font-semibold text-gray-900 mb-2">{title}</h3>
    <p className="text-gray-600 text-sm mb-3">{description}</p>
    <div className="flex items-center text-sm text-gray-500 mb-2">
     <Users className="w-4 h-4 mr-1" />
     {instructor}
    </div>
   </div>
   <div className="text-right">
    <div className="text-2xl font-bold text-blue-600">{progress}%</div>
    <div className="text-sm text-gray-500">Complete</div>
   </div>
  </div>

  <div className="mb-4">
   <div className="flex justify-between text-sm text-gray-600 mb-1">
    <span>Progress</span>
    <span>{progress}%</span>
   </div>
   <div className="w-full bg-gray-200 rounded-full h-2">
    <div
     className="bg-blue-600 h-2 rounded-full transition-all duration-300"
     style={{ width: `${progress}%` }}
    />
   </div>
  </div>

  <div className="mb-4">
   <p className="text-sm font-medium text-gray-700 mb-2">Skills you'll master:</p>
   <div className="flex flex-wrap gap-1">
    {skills.map((skill, index) => (
     <span
      key={index}
      className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full"
     >
      {skill}
     </span>
    ))}
   </div>
  </div>

  <button
   onClick={onContinue}
   className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center"
  >
   <Play className="w-4 h-4 mr-2" />
   Continue Learning
  </button>
 </div>
);

interface SkillProgressProps {
 skill: string;
 level: number;
 maxLevel: number;
 progress: number;
}

const SkillProgress: React.FC<SkillProgressProps> = ({ skill, level, maxLevel, progress }) => (
 <div className="bg-white rounded-lg p-4 border border-gray-200 transition-colors duration-300">
  <div className="flex items-center justify-between mb-2">
   <h4 className="font-medium text-gray-900">{skill}</h4>
   <span className="text-sm text-gray-500">Level {level}/{maxLevel}</span>
  </div>
  <div className="w-full bg-gray-200 rounded-full h-2">
   <div
    className="bg-green-600 h-2 rounded-full transition-all duration-300"
    style={{ width: `${progress}%` }}
   />
  </div>
 </div>
);

export const LearnerInterface: React.FC = () => {
 const [showRoleMenu, setShowRoleMenu] = useState(false);
 const { setUserRole } = useUserStore();
 const enrolledCourses = [
  {
   id:'1',
   title:'Introduction to JavaScript',
   description:'Master the fundamentals of JavaScript programming',
   progress: 75,
   skills: ['Variables','Functions','DOM Manipulation'],
   instructor:'Sarah Johnson',
  },
  {
   id:'2',
   title:'Data Science Fundamentals',
   description:'Learn data analysis and visualization techniques',
   progress: 45,
   skills: ['Statistics','Python','Visualization'],
   instructor:'Dr. Michael Chen',
  },
  {
   id:'3',
   title:'Web Development Bootcamp',
   description:'Build modern web applications from scratch',
   progress: 20,
   skills: ['HTML','CSS','React','Node.js'],
   instructor:'Alex Rodriguez',
  },
 ];

 const skillProgress = [
  { skill:'JavaScript', level: 3, maxLevel: 5, progress: 60 },
  { skill:'Python', level: 2, maxLevel: 5, progress: 40 },
  { skill:'Data Analysis', level: 1, maxLevel: 5, progress: 20 },
  { skill:'Web Development', level: 2, maxLevel: 5, progress: 40 },
 ];

 const handleContinueCourse = (courseId: string) => {
  console.log('Continue course:', courseId);
  // TODO: Navigate to course content
 };

 return (
  <div className="min-h-screen bg-gray-50 transition-colors duration-300">
   {/* Header */}
   <div className="bg-white shadow-sm border-b border-gray-200 transition-colors duration-300">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
     <div className="flex items-center justify-between h-16">
      <div>
       <h1 className="text-2xl font-bold text-gray-900">My Learning Dashboard</h1>
       <p className="text-gray-600">Continue your skill development journey</p>
      </div>
      <div className="flex items-center space-x-4">
       <div className="text-right">
        <div className="text-sm text-gray-500">Total XP</div>
        <div className="text-lg font-semibold text-gray-900">2,450</div>
       </div>
       <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center">
        <Award className="w-5 h-5 text-white" />
       </div>
       <div className="relative">
        <button
         onClick={() => setShowRoleMenu(!showRoleMenu)}
         className="p-2 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100"
        >
         <Settings className="w-5 h-5" />
        </button>
        {showRoleMenu && (
         <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-10">
          <div className="p-2">
           <p className="text-xs font-medium text-gray-500 mb-2">Switch Role</p>
           <button
            onClick={() => {
             setUserRole('educator');
             setShowRoleMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded"
           >
            Switch to Educator
           </button>
           <button
            onClick={() => {
             setUserRole('admin');
             setShowRoleMenu(false);
            }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-gray-50 text-gray-700 rounded"
           >
            Switch to Admin
           </button>
          </div>
         </div>
        )}
       </div>
      </div>
     </div>
    </div>
   </div>

   <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
    {/* Quick Stats */}
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
     <div className="bg-white rounded-lg p-6 border border-gray-200 transition-colors duration-300">
      <div className="flex items-center">
       <BookOpen className="w-8 h-8 text-blue-600" />
       <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Courses</p>
        <p className="text-2xl font-bold text-gray-900">3</p>
       </div>
      </div>
     </div>
     <div className="bg-white rounded-lg p-6 border border-gray-200 transition-colors duration-300">
      <div className="flex items-center">
       <Target className="w-8 h-8 text-green-600" />
       <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Skills</p>
        <p className="text-2xl font-bold text-gray-900">12</p>
       </div>
      </div>
     </div>
     <div className="bg-white rounded-lg p-6 border border-gray-200 transition-colors duration-300">
      <div className="flex items-center">
       <TrendingUp className="w-8 h-8 text-purple-600" />
       <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Avg Progress</p>
        <p className="text-2xl font-bold text-gray-900">47%</p>
       </div>
      </div>
     </div>
     <div className="bg-white rounded-lg p-6 border border-gray-200 transition-colors duration-300">
      <div className="flex items-center">
       <Award className="w-8 h-8 text-yellow-600" />
       <div className="ml-4">
        <p className="text-sm font-medium text-gray-600">Certificates</p>
        <p className="text-2xl font-bold text-gray-900">1</p>
       </div>
      </div>
     </div>
    </div>

    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
     {/* Enrolled Courses */}
     <div className="lg:col-span-2">
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Continue Learning</h2>
      <div className="space-y-6">
       {enrolledCourses.map((course) => (
        <CourseCard
         key={course.id}
         title={course.title}
         description={course.description}
         progress={course.progress}
         skills={course.skills}
         instructor={course.instructor}
         onContinue={() => handleContinueCourse(course.id)}
        />
       ))}
      </div>
     </div>

     {/* Skill Progress */}
     <div>
      <h2 className="text-xl font-semibold text-gray-900 mb-6">Skill Development</h2>
      <div className="space-y-4">
       {skillProgress.map((skill, index) => (
        <SkillProgress
         key={index}
         skill={skill.skill}
         level={skill.level}
         maxLevel={skill.maxLevel}
         progress={skill.progress}
        />
       ))}
      </div>

      {/* Recommended Actions */}
      <div className="mt-8">
       <h3 className="text-lg font-semibold text-gray-900 mb-4">Recommended Next Steps</h3>
       <div className="space-y-3">
        <button className="w-full text-left p-3 bg-blue-50 border border-blue-200 rounded-lg hover:bg-blue-100 transition-colors">
         <p className="font-medium text-blue-900">Complete JavaScript Functions Module</p>
         <p className="text-sm text-blue-700">25 min remaining</p>
        </button>
        <button className="w-full text-left p-3 bg-green-50 border border-green-200 rounded-lg hover:bg-green-100 transition-colors">
         <p className="font-medium text-green-900">Practice Python Data Analysis</p>
         <p className="text-sm text-green-700">New challenge available</p>
        </button>
       </div>
      </div>
     </div>
    </div>
   </div>
  </div>
 );
};