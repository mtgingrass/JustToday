//
//  EllipsisMenu.swift
//  SimpleHabit
//
//  Created by Mark Gingrass on 5/14/25.
//

import SwiftUI
import Foundation

struct EllipsisMenu: View {
    var onSetDate: () -> Void
    var onSetGoal: () -> Void
    var onResetStreak: () -> Void
    var onResetRecord: () -> Void
    var onRename: () -> Void

    var body: some View {
        Menu {
            Button("Set Start Date", action: onSetDate)
            Button("Set Goal", action: onSetGoal)
            Button("Restart Streak", action: onResetStreak)
            Button("Rename Habit", action: onRename)
            Button("⚠️ Reset Record") {
                onResetRecord()
            }
        } label: {
            Image(systemName: "ellipsis.circle")
                .font(.title3)
                .padding(.horizontal, 8)
                .foregroundColor(.primary)
        }
    }
}
