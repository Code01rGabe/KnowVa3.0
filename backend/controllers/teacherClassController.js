const Classroom = require('../models/Classroom');
const Attendance = require('../models/Attendance');
const User = require('../models/User');
const Submission = require('../models/Submission');
const Assignment = require('../models/Assignment');
const Course = require('../models/Course');

// Get teacher's classrooms
const getTeacherClassrooms = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school assigned to this account' });
    }

    const classrooms = await Classroom.find({
      schoolId,
      teachers: teacherId,
    })
      .populate('students', 'profile.name email')
      .populate('teachers', 'profile.name email')
      .select('name description level students teachers createdAt')
      .sort({ createdAt: -1 });

    res.json({
      classrooms,
    });
  } catch (error) {
    console.error('Get teacher classrooms error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get single classroom details
const getClassroomDetails = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;
    const { classroomId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school assigned to this account' });
    }

    const classroom = await Classroom.findOne({
      _id: classroomId,
      schoolId,
      teachers: teacherId,
    })
      .populate('students', 'profile.name email')
      .populate('teachers', 'profile.name email');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or access denied' });
    }

    // Get recent attendance records
    const recentAttendance = await Attendance.find({
      classroomId: classroom._id,
      schoolId,
    })
      .populate('studentId', 'profile.name email')
      .sort({ date: -1 })
      .limit(50);

    // Get student academic performance
    const studentIds = classroom.students.map((s) => s._id || s);
    const submissions = await Submission.find({
      studentId: { $in: studentIds },
    })
      .populate('assignmentId', 'title maxPoints courseId')
      .populate('studentId', 'profile.name email')
      .sort({ updatedAt: -1 });

    // Calculate student stats
    const studentStats = studentIds.map((studentId) => {
      const studentSubmissions = submissions.filter(
        (s) => (s.studentId._id || s.studentId).toString() === studentId.toString()
      );
      const gradedSubmissions = studentSubmissions.filter((s) => s.grade !== null && s.grade !== undefined);
      const averageGrade = gradedSubmissions.length
        ? Number((gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(1))
        : null;
      const pendingCount = studentSubmissions.filter((s) => s.status === 'pending').length;

      return {
        studentId,
        totalSubmissions: studentSubmissions.length,
        gradedCount: gradedSubmissions.length,
        averageGrade,
        pendingCount,
      };
    });

    res.json({
      classroom: {
        ...classroom.toObject(),
        studentStats,
      },
      recentAttendance,
    });
  } catch (error) {
    console.error('Get classroom details error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Record attendance for a classroom
const recordClassroomAttendance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;
    const { classroomId } = req.params;
    const { date, records } = req.body;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school assigned to this account' });
    }

    // Verify teacher has access to this classroom
    const classroom = await Classroom.findOne({
      _id: classroomId,
      schoolId,
      teachers: teacherId,
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or access denied' });
    }

    const attendanceDate = date || new Date().toISOString().split('T')[0];

    const attendanceRecords = await Promise.all(
      records.map((record) =>
        Attendance.findOneAndUpdate(
          { schoolId, studentId: record.studentId, date: attendanceDate },
          {
            schoolId,
            classroomId,
            studentId: record.studentId,
            date: attendanceDate,
            status: record.status || 'present',
            recordedBy: teacherId,
            notes: record.notes || '',
          },
          { new: true, upsert: true }
        )
      )
    );

    res.json({
      message: 'Attendance recorded successfully',
      records: attendanceRecords,
    });
  } catch (error) {
    console.error('Record classroom attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get attendance for a classroom
const getClassroomAttendance = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;
    const { classroomId } = req.params;
    const { from, to } = req.query;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school assigned to this account' });
    }

    // Verify teacher has access
    const classroom = await Classroom.findOne({
      _id: classroomId,
      schoolId,
      teachers: teacherId,
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or access denied' });
    }

    const filter = { schoolId, classroomId };
    if (from && to) {
      filter.date = {
        $gte: new Date(from),
        $lte: new Date(to),
      };
    }

    const attendance = await Attendance.find(filter)
      .populate('studentId', 'profile.name email')
      .sort({ date: -1 });

    res.json({
      attendance,
    });
  } catch (error) {
    console.error('Get classroom attendance error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get student profile and academic history
const getStudentProfile = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;
    const { studentId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school assigned to this account' });
    }

    // Verify teacher has access to this student (through a classroom)
    const classroom = await Classroom.findOne({
      schoolId,
      teachers: teacherId,
      students: studentId,
    });

    if (!classroom) {
      return res.status(404).json({ message: 'Student not found in your classes' });
    }

    // Get student details
    const student = await User.findById(studentId).select('profile email role schoolId');

    // Get all submissions
    const submissions = await Submission.find({ studentId })
      .populate('assignmentId', 'title maxPoints dueDate courseId')
      .populate('assignmentId.courseId', 'title')
      .sort({ updatedAt: -1 });

    // Get attendance records
    const attendance = await Attendance.find({
      schoolId,
      studentId,
    })
      .populate('classroomId', 'name')
      .sort({ date: -1 })
      .limit(100);

    // Calculate statistics
    const gradedSubmissions = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
    const averageGrade = gradedSubmissions.length
      ? Number((gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(1))
      : null;

    const attendanceStats = {
      total: attendance.length,
      present: attendance.filter((a) => a.status === 'present').length,
      absent: attendance.filter((a) => a.status === 'absent').length,
      late: attendance.filter((a) => a.status === 'late').length,
      excused: attendance.filter((a) => a.status === 'excused').length,
    };

    res.json({
      student,
      submissions,
      attendance,
      statistics: {
        averageGrade,
        totalSubmissions: submissions.length,
        gradedSubmissions: gradedSubmissions.length,
        pendingSubmissions: submissions.filter((s) => s.status === 'pending').length,
        attendanceStats,
      },
    });
  } catch (error) {
    console.error('Get student profile error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

// Get classroom analytics
const getClassroomAnalytics = async (req, res) => {
  try {
    const teacherId = req.user.userId;
    const schoolId = req.user.schoolId;
    const { classroomId } = req.params;

    if (!schoolId) {
      return res.status(400).json({ message: 'No school assigned to this account' });
    }

    const classroom = await Classroom.findOne({
      _id: classroomId,
      schoolId,
      teachers: teacherId,
    }).populate('students', 'profile.name email');

    if (!classroom) {
      return res.status(404).json({ message: 'Classroom not found or access denied' });
    }

    const studentIds = classroom.students.map((s) => s._id || s);

    // Get all assignments and submissions for students in this class
    const courses = await Course.find({ teacherId }).select('_id title');
    const courseIds = courses.map((c) => c._id);
    const assignments = await Assignment.find({ courseId: { $in: courseIds } }).select('_id title maxPoints dueDate courseId');
    const assignmentIds = assignments.map((a) => a._id);

    const submissions = await Submission.find({
      studentId: { $in: studentIds },
      assignmentId: { $in: assignmentIds },
    })
      .populate('assignmentId', 'title maxPoints courseId')
      .populate('studentId', 'profile.name email');

    // Calculate analytics
    const gradedSubmissions = submissions.filter((s) => s.grade !== null && s.grade !== undefined);
    const averageScore = gradedSubmissions.length
      ? Number((gradedSubmissions.reduce((sum, s) => sum + s.grade, 0) / gradedSubmissions.length).toFixed(1))
      : null;

    // Find struggling students (average grade below 60)
    const studentGrades = {};
    studentIds.forEach((studentId) => {
      const studentSubmissions = gradedSubmissions.filter(
        (s) => (s.studentId._id || s.studentId).toString() === studentId.toString()
      );
      if (studentSubmissions.length > 0) {
        const avg = studentSubmissions.reduce((sum, s) => sum + s.grade, 0) / studentSubmissions.length;
        studentGrades[studentId.toString()] = avg;
      }
    });

    const strugglingStudents = Object.entries(studentGrades)
      .filter(([_, grade]) => grade < 60)
      .map(([studentId, grade]) => {
        const student = classroom.students.find((s) => (s._id || s).toString() === studentId);
        return {
          studentId,
          name: student?.profile?.name || student?.email,
          averageGrade: Number(grade.toFixed(1)),
        };
      });

    // Completion rates
    const totalAssignments = assignments.length;
    const completedAssignments = submissions.filter((s) => s.status === 'graded').length;
    const completionRate = totalAssignments > 0 ? Number(((completedAssignments / (totalAssignments * studentIds.length)) * 100).toFixed(1)) : 0;

    // Attendance stats
    const attendance = await Attendance.find({
      classroomId: classroom._id,
      schoolId,
    });
    const attendanceRate = attendance.length > 0
      ? Number(((attendance.filter((a) => a.status === 'present').length / attendance.length) * 100).toFixed(1))
      : 0;

    res.json({
      classroom: {
        id: classroom._id,
        name: classroom.name,
        level: classroom.level,
        studentCount: studentIds.length,
      },
      analytics: {
        averageScore,
        strugglingStudents,
        completionRate,
        attendanceRate,
        totalAssignments,
        completedAssignments,
        totalSubmissions: submissions.length,
      },
    });
  } catch (error) {
    console.error('Get classroom analytics error:', error);
    res.status(500).json({ message: 'Server error', error: error.message });
  }
};

module.exports = {
  getTeacherClassrooms,
  getClassroomDetails,
  recordClassroomAttendance,
  getClassroomAttendance,
  getStudentProfile,
  getClassroomAnalytics,
};

