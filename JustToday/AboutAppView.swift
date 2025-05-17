//
//  AboutAppView.swift
//  SimpleHabit
//
//  Created by Mark Gingrass on 5/14/25.
//

import SwiftUI

struct AboutAppView: View {
    @Environment(\.dismiss) private var dismiss

    var body: some View {
        ScrollView {
            ZStack(alignment: .topTrailing) {
                VStack(alignment: .leading, spacing: 16) {
                    Text("About SimpleHabit")
                        .font(.largeTitle)
                        .fontWeight(.bold)

                    Text("SimpleHabit is a minimalist habit-tracking app that provides a distraction-free interface. This tracker has the added benefit to track what you STOP doing, as explained below")

                    Text("Inspiration")
                        .font(.headline)

                    Text("This app was inspired by the supportive and courageous community on the Stop Drinking subreddit. Their stories and struggles highlighted that stopping something can be just as powerful as starting something new. That's why the priority habit in this app is focused on what you're choosing to stop, not just what you're doing. It's a space to honor restraint, recovery, and renewal.")

                    Text("This app was built with SwiftUI by Mark Gingrass. Thank you for trying it out!")
                        .font(.footnote)
                        .foregroundColor(.secondary)

                    Spacer()
                }
                .padding()

                Button(action: { dismiss() }) {
                    Image(systemName: "xmark.circle.fill")
                        .imageScale(.large)
                        .foregroundColor(.secondary)
                        .padding()
                }
            }
        }
    }
}

#Preview {
    AboutAppView()
}
